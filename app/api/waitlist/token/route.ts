import { issueFormToken } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

/** Signed timestamp for the waitlist form, fetched only when someone focuses the email field. */
export async function GET(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return json({ ok: false }, 403);
  const limit = rateLimit(`token:${clientIp(request)}`, 20, 60_000);
  if (!limit.ok) return json({ ok: false, code: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfter) });
  return json({ ok: true, token: issueFormToken() });
}
