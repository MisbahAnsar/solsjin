import { createHash } from "node:crypto";
import { isAdmin, sameOrigin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { DEFAULT_BODY, DEFAULT_SUBJECT, sendBatch } from "@/lib/server/email";
import { errorResponse, json } from "@/lib/server/http";
import { normalizeEmail } from "@/lib/server/validate";

export const maxDuration = 60;

const BATCH = 100;
const TIME_BUDGET_MS = 40_000;

/**
 * mode "test": sends one email to `to`.
 * mode "launch": sends to every subscriber with notified_at null, 100 per Resend call. Rows are
 * claimed (notified_at set) with SKIP LOCKED before sending and released if the send fails, so
 * concurrent or repeated runs never email anyone twice. Returns `remaining` so the UI can call again.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ ok: false, error: "Unauthorized" }, 401);
  const body = await request.json().catch(() => ({}));
  const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject.trim().slice(0, 200) : DEFAULT_SUBJECT;
  const text = typeof body.body === "string" && body.body.trim() ? body.body.slice(0, 20_000) : DEFAULT_BODY;

  try {
    if (body.mode === "test") {
      const to = normalizeEmail(body.to);
      if (!to.ok) return json({ ok: false, error: to.error }, 400);
      const { dryRun } = await sendBatch([{ to: to.email, subject: `[Test] ${subject}`, body: text }]);
      return json({ ok: true, sent: 1, dryRun });
    }
    if (body.mode !== "launch") return json({ ok: false, error: "Unknown mode" }, 400);

    const sql = await db();
    if (!process.env.RESEND_API_KEY) {
      // Dry run: nothing is sent and nothing is marked, so the real launch still reaches everyone.
      const [{ pending }] = await sql<{ pending: number }[]>`select count(*)::int as pending from waitlist where notified_at is null and unsubscribed_at is null`;
      console.info(`[email] dry run: launch would go to ${pending} subscriber(s)`);
      return json({ ok: true, sent: pending, remaining: pending, dryRun: true });
    }
    const started = Date.now();
    let sent = 0;
    while (Date.now() - started < TIME_BUDGET_MS) {
      const claimed = await sql<{ id: string; email: string }[]>`
        update waitlist set notified_at = now()
        where id in (
          select id from waitlist where notified_at is null and unsubscribed_at is null
          order by id limit ${BATCH} for update skip locked
        )
        returning id, email`;
      if (claimed.length === 0) break;
      const ids = claimed.map((row) => row.id);
      try {
        const key = createHash("sha256").update(`launch:${subject}:${ids.join(",")}`).digest("hex");
        await sendBatch(claimed.map((row) => ({ to: row.email, subject, body: text })), key);
        sent += claimed.length;
      } catch (error) {
        await sql`update waitlist set notified_at = null where id = any(${ids}::bigint[])`;
        throw error;
      }
    }
    const [{ remaining }] = await sql<{ remaining: number }[]>`select count(*)::int as remaining from waitlist where notified_at is null and unsubscribed_at is null`;
    return json({ ok: true, sent, remaining, dryRun: false });
  } catch (error) {
    // Admin-only endpoint: surface provider errors (bad key, unverified domain...) so they can be fixed.
    if (error instanceof Error && /^(Resend|EMAIL_FROM)/.test(error.message)) {
      console.error("[admin/send]", error.message);
      return json({ ok: false, error: error.message }, 502);
    }
    return errorResponse(error, "admin/send");
  }
}
