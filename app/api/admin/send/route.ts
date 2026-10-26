import { createHash } from "node:crypto";
import { isAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { DEFAULT_BODY, DEFAULT_SUBJECT, sendBatch } from "@/lib/server/email";
import { readJsonBody, tooMany } from "@/lib/server/guard";
import { errorResponse, json } from "@/lib/server/http";
import { acquireLease, durableLimit } from "@/lib/server/rate-limit";
import { normalizeEmail } from "@/lib/server/validate";

export const maxDuration = 60;

const BATCH = 100;
const TIME_BUDGET_MS = 40_000;
/** Resend free plan: 100 emails/day, 3,000/month. Override if you upgrade. */
const DAILY_LIMIT = Number(process.env.EMAIL_DAILY_LIMIT) || 100;
const MONTHLY_LIMIT = Number(process.env.EMAIL_MONTHLY_LIMIT) || 3000;

type Sql = Awaited<ReturnType<typeof db>>;

/** Emails still allowed today / this month (UTC, like Resend), counting test sends too. */
async function quotaLeft(sql: Sql) {
  await sql`insert into email_quota (day, sent) values ((now() at time zone 'utc')::date, 0) on conflict (day) do nothing`;
  const [row] = await sql<{ today: number; month: number }[]>`
    select coalesce(sum(sent) filter (where day = (now() at time zone 'utc')::date), 0)::int as today,
           coalesce(sum(sent), 0)::int as month
    from email_quota where day >= date_trunc('month', now() at time zone 'utc')::date`;
  return Math.max(
    0,
    Math.min(DAILY_LIMIT - row.today, MONTHLY_LIMIT - row.month),
  );
}

const addSent = (sql: Sql, n: number) =>
  sql`update email_quota set sent = sent + ${n} where day = (now() at time zone 'utc')::date`;

function nextUtcMidnight() {
  const d = new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1),
  ).toISOString();
}

/**
 * mode "test": sends one email to `to`.
 * mode "launch": sends to every subscriber with notified_at null, 100 per Resend call. Rows are
 * claimed (notified_at set) with SKIP LOCKED before sending and released if the send fails, so
 * concurrent or repeated runs never email anyone twice. Returns `remaining` so the UI can call again.
 * Only one launch run at a time (lease), launch needs confirm: "launch", and sends stop at the
 * daily/monthly email quota (quotaReached + resetsAt), so the rest go out when you resume tomorrow.
 */
export async function POST(request: Request) {
  const parsed = await readJsonBody(request, 64 * 1024);
  if ("response" in parsed) return parsed.response;
  if (!(await isAdmin()))
    return json({ ok: false, error: "Unauthorized" }, 401);
  const body = parsed.body;
  const subject =
    typeof body.subject === "string" && body.subject.trim()
      ? body.subject.trim().slice(0, 200)
      : DEFAULT_SUBJECT;
  const text =
    typeof body.body === "string" && body.body.trim()
      ? body.body.slice(0, 20_000)
      : DEFAULT_BODY;

  try {
    if (body.mode === "test") {
      const to = normalizeEmail(body.to);
      if (!to.ok) return json({ ok: false, error: to.error }, 400);
      const limit = await durableLimit([
        { key: "send:test:h", limit: 10, windowSec: 3600 },
      ]);
      if (!limit.ok)
        return tooMany(limit.retryAfter, "Test email limit reached (10/hour).");
      const sql = await db();
      if (process.env.RESEND_API_KEY && (await quotaLeft(sql)) < 1)
        return json(
          {
            ok: false,
            code: "quota",
            error: `Daily email limit reached (${DAILY_LIMIT}/day). Try again after ${nextUtcMidnight()}.`,
          },
          429,
        );
      const { dryRun } = await sendBatch([
        { to: to.email, subject: `[Test] ${subject}`, body: text },
      ]);
      if (!dryRun) await addSent(sql, 1);
      return json({ ok: true, sent: 1, dryRun });
    }
    if (body.mode !== "launch")
      return json({ ok: false, error: "Unknown mode" }, 400);
    if (body.confirm !== "launch")
      return json({ ok: false, error: "Missing confirmation." }, 400);

    const sql = await db();
    if (!process.env.RESEND_API_KEY) {
      // Dry run: nothing is sent and nothing is marked, so the real launch still reaches everyone.
      const [{ pending }] = await sql<
        { pending: number }[]
      >`select count(*)::int as pending from waitlist where notified_at is null and unsubscribed_at is null`;
      console.info(
        `[email] dry run: launch would go to ${pending} subscriber(s)`,
      );
      return json({
        ok: true,
        sent: pending,
        remaining: pending,
        dryRun: true,
      });
    }
    const release = await acquireLease("launch", 90);
    if (!release)
      return json(
        {
          ok: false,
          code: "busy",
          error:
            "Another send is already running. Wait a minute and try again.",
        },
        409,
      );
    const started = Date.now();
    let sent = 0;
    let quotaReached = false;
    try {
      while (Date.now() - started < TIME_BUDGET_MS) {
        const allowance = Math.min(BATCH, await quotaLeft(sql));
        if (allowance < 1) {
          quotaReached = true;
          break;
        }
        const claimed = await sql<{ id: string; email: string }[]>`
        update waitlist set notified_at = now()
        where id in (
          select id from waitlist where notified_at is null and unsubscribed_at is null
          order by id limit ${allowance} for update skip locked
        )
        returning id, email`;
        if (claimed.length === 0) break;
        const ids = claimed.map((row) => row.id);
        try {
          const key = createHash("sha256")
            .update(`launch:${subject}:${ids.join(",")}`)
            .digest("hex");
          await sendBatch(
            claimed.map((row) => ({ to: row.email, subject, body: text })),
            key,
          );
          sent += claimed.length;
          await addSent(sql, claimed.length);
        } catch (error) {
          await sql`update waitlist set notified_at = null where id = any(${ids}::bigint[])`;
          throw error;
        }
      }
    } finally {
      await release().catch(() => {});
    }
    const [{ remaining }] = await sql<
      { remaining: number }[]
    >`select count(*)::int as remaining from waitlist where notified_at is null and unsubscribed_at is null`;
    if (remaining > 0 && !quotaReached && (await quotaLeft(sql)) < 1)
      quotaReached = true;
    return json({
      ok: true,
      sent,
      remaining,
      dryRun: false,
      quotaReached: quotaReached && remaining > 0,
      resetsAt: nextUtcMidnight(),
      dailyLimit: DAILY_LIMIT,
    });
  } catch (error) {
    // Admin-only endpoint: surface provider errors (bad key, unverified domain...) so they can be fixed.
    if (error instanceof Error && /^(Resend|EMAIL_FROM)/.test(error.message)) {
      console.error("[admin/send]", error.message);
      return json({ ok: false, error: error.message }, 502);
    }
    return errorResponse(error, "admin/send");
  }
}
