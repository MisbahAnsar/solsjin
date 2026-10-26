import { cookies } from "next/headers";
import { checkPassword, createSessionValue, isAdminConfigured, sessionCookie } from "@/lib/server/auth";
import { readJsonBody, tooMany } from "@/lib/server/guard";
import { json } from "@/lib/server/http";
import { clientIp, durableLimit, rateLimit, resetLimit } from "@/lib/server/rate-limit";

/**
 * Per IP: 5 attempts / 10 min and 20 / day (then locked out for the rest of the day). Globally:
 * 50 / hour, so a botnet can't brute-force ADMIN_SECRET either. Counters live in Postgres.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const burst = rateLimit(`login:${ip}`, 5, 10 * 60_000);
  if (!burst.ok) return tooMany(burst.retryAfter, "Too many attempts. Try again later.");
  const parsed = await readJsonBody(request, 1024);
  if ("response" in parsed) return parsed.response;
  if (!isAdminConfigured()) return json({ ok: false, code: "not_configured", error: "ADMIN_SECRET is not set (min 12 characters)." }, 503);

  const windows = [
    { key: `login:ip:10m:${ip}`, limit: 5, windowSec: 600 },
    { key: `login:ip:d:${ip}`, limit: 20, windowSec: 86_400 },
    { key: "login:global:h", limit: 50, windowSec: 3600 },
  ];
  try {
    const limit = await durableLimit(windows);
    if (!limit.ok) return tooMany(limit.retryAfter, "Too many attempts. Try again later.");
  } catch (error) {
    // DB down: the in-memory limit above still applies; don't lock the owner out of their console.
    console.error("[admin/login] durable limit unavailable", error instanceof Error ? error.message : error);
  }

  if (!checkPassword(parsed.body.password)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return json({ ok: false, error: "Wrong password." }, 401);
  }
  await resetLimit([windows[0].key]).catch(() => {});
  (await cookies()).set({ ...sessionCookie, value: createSessionValue() });
  return json({ ok: true });
}
