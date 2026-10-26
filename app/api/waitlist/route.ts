import { db } from "@/lib/server/db";
import { errorResponse, json } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { cleanSource, normalizeEmail } from "@/lib/server/validate";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`waitlist:${ip}`, 5, 60_000);
  if (!limit.ok)
    return json({ ok: false, code: "rate_limited", error: "Too many attempts. Try again in a minute." }, 429, { "Retry-After": String(limit.retryAfter) });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "invalid", error: "Invalid request." }, 400);
  }

  // Honeypot: real people never see or fill this field. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") return json({ ok: true, status: "subscribed" });

  const parsed = normalizeEmail(body.email);
  if (!parsed.ok) return json({ ok: false, code: "invalid", error: parsed.error }, 400);

  try {
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
