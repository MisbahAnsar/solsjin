import { createHash } from "node:crypto";
import { db } from "./db";

/**
 * Two layers:
 * 1. `rateLimit`: in-memory fixed window per serverless instance. Free, stops bursts before any DB work.
 * 2. `durableLimit`: Postgres fixed windows shared by every instance (table rate_limits), one round trip
 *    for several windows at once. Keys are hashed so no raw IPs are stored.
 * Vercel Firewall rules sit in front of both (see SECURITY.md).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return bucket.count > limit ? { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export type Window = { key: string; limit: number; windowSec: number };

const hashKey = (key: string) => createHash("sha256").update(key).digest("base64url").slice(0, 32);

/** Counts one hit against every window; ok=false (with the longest wait) if any is over its limit. */
export async function durableLimit(windows: Window[]): Promise<{ ok: boolean; retryAfter: number }> {
  const sql = await db();
  const keys = windows.map((w) => hashKey(w.key));
  const rows = await sql<{ key: string; count: number; retry: number }[]>`
    insert into rate_limits (key, count, reset_at)
    select k, 1, now() + make_interval(secs => w) from unnest(${keys}::text[], ${windows.map((w) => w.windowSec)}::int[]) as t(k, w)
    on conflict (key) do update set
      count    = case when rate_limits.reset_at <= now() then 1 else rate_limits.count + 1 end,
      reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
    returning key, count, greatest(1, ceil(extract(epoch from reset_at - now())))::int as retry`;
  if (Math.random() < 0.02) void sql`delete from rate_limits where reset_at < now() - interval '1 day'`.catch(() => {});
  let retryAfter = 0;
  for (const row of rows) {
    const w = windows[keys.indexOf(row.key)];
    if (w && row.count > w.limit) retryAfter = Math.max(retryAfter, row.retry);
  }
  return { ok: retryAfter === 0, retryAfter };
}

/** Clears windows (e.g. after a successful login). */
export async function resetLimit(keys: string[]) {
  const sql = await db();
  await sql`delete from rate_limits where key = any(${keys.map(hashKey)}::text[])`;
}

/** Short lease (a row in rate_limits) so only one launch batch runs at a time across instances. */
export async function acquireLease(name: string, seconds: number) {
  const sql = await db();
  const key = hashKey(`lease:${name}`);
  const rows = await sql`
    insert into rate_limits (key, count, reset_at) values (${key}, 1, now() + make_interval(secs => ${seconds}))
    on conflict (key) do update set count = 1, reset_at = excluded.reset_at where rate_limits.reset_at <= now()
    returning key`;
  return rows.length > 0 ? async () => void (await sql`delete from rate_limits where key = ${key}`) : null;
}

/** Vercel sets x-real-ip / x-forwarded-for to the real client IP (clients can't spoof it there). */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (request.headers.get("x-real-ip") || forwarded?.split(",")[0] || "unknown").trim();
}
