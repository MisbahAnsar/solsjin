import { db } from "@/lib/server/db";
import { checkFormToken, readJsonBody, tooMany } from "@/lib/server/guard";
import { errorResponse, json } from "@/lib/server/http";
import { clientIp, durableLimit, rateLimit } from "@/lib/server/rate-limit";
import { cleanSource, normalizeEmail } from "@/lib/server/validate";

/** Per-IP and global caps. Everything before the DB is free; only plausible signups touch Postgres. */
const PER_IP_MINUTE = 5;
const PER_IP_DAY = 20;
const GLOBAL_MINUTE = 60;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const burst = rateLimit(`waitlist:${ip}`, 8, 60_000);
  if (!burst.ok) return tooMany(burst.retryAfter);

  const parsedBody = await readJsonBody(request);
  if ("response" in parsedBody) return parsedBody.response;
  const { body } = parsedBody;

  // Honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") return json({ ok: true, status: "subscribed" });

  const token = checkFormToken(body.token);
  if (token !== "ok") return json({ ok: false, code: "token", reason: token, error: "Please try again." }, 400);

  const parsed = normalizeEmail(body.email);
  if (!parsed.ok) return json({ ok: false, code: "invalid", error: parsed.error }, 400);

  try {
    const limit = await durableLimit([
      { key: `wl:ip:m:${ip}`, limit: PER_IP_MINUTE, windowSec: 60 },
      { key: `wl:ip:d:${ip}`, limit: PER_IP_DAY, windowSec: 86_400 },
      { key: "wl:global:m", limit: GLOBAL_MINUTE, windowSec: 60 },
    ]);
    if (!limit.ok) return tooMany(limit.retryAfter, "Too many signups right now. Try again a little later.");

    const sql = await db();
    const rows = await sql<{ id: string; resubscribed: boolean }[]>`
      insert into waitlist (email, source) values (${parsed.email}, ${cleanSource(body.source) ?? "coming-soon"})
      on conflict (email) do update set unsubscribed_at = null where waitlist.unsubscribed_at is not null
      returning id, (xmax <> 0) as resubscribed`;
    if (rows.length === 0) return json({ ok: true, status: "already_subscribed" });
    return json({ ok: true, status: rows[0].resubscribed ? "resubscribed" : "subscribed" }, rows[0].resubscribed ? 200 : 201);
  } catch (error) {
    return errorResponse(error, "waitlist");
  }
}
