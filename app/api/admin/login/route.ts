import { cookies } from "next/headers";
import { checkPassword, createSessionValue, isAdminConfigured, sameOrigin, sessionCookie } from "@/lib/server/auth";
import { json } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden" }, 403);
  if (!isAdminConfigured()) return json({ ok: false, code: "not_configured", error: "ADMIN_SECRET is not set (min 12 characters)." }, 503);
  const limit = rateLimit(`login:${clientIp(request)}`, 5, 10 * 60_000);
  if (!limit.ok) return json({ ok: false, error: "Too many attempts. Try again later." }, 429, { "Retry-After": String(limit.retryAfter) });
  const body = await request.json().catch(() => ({}));
  if (!checkPassword(body?.password)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return json({ ok: false, error: "Wrong password." }, 401);
  }
  (await cookies()).set({ ...sessionCookie, value: createSessionValue() });
  return json({ ok: true });
}
