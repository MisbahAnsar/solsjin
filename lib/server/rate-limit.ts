/**
 * Fixed-window in-memory limiter, keyed by IP. It is per serverless instance, so it stops bursts and
 * casual abuse rather than a distributed attack. Put a WAF / Vercel Firewall rule in front for that.
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

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}
