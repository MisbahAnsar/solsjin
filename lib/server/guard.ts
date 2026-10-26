import { createHmac } from "node:crypto";
import { safeEqual, sameOrigin } from "./auth";
import { json } from "./http";

/** Browser-only POSTs: Origin must be this host (or Sec-Fetch-Site same-origin). Blocks CSRF. */
export const isSameOrigin = sameOrigin;

/** Same-origin + JSON + small body. Returns the parsed object or a ready error response. */
export async function readJsonBody(request: Request, maxBytes = 2048): Promise<{ body: Record<string, unknown> } | { response: Response }> {
  if (!isSameOrigin(request)) return { response: json({ ok: false, code: "forbidden", error: "Forbidden" }, 403) };
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json"))
    return { response: json({ ok: false, code: "invalid", error: "Invalid request." }, 415) };
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return { response: json({ ok: false, code: "invalid", error: "Request too large." }, 413) };
  const text = await request.text();
  if (text.length > maxBytes) return { response: json({ ok: false, code: "invalid", error: "Request too large." }, 413) };
  try {
    const body = JSON.parse(text);
    if (body && typeof body === "object" && !Array.isArray(body)) return { body };
  } catch {}
  return { response: json({ ok: false, code: "invalid", error: "Invalid request." }, 400) };
}

export function tooMany(retryAfter: number, error = "Too many attempts. Try again in a minute.") {
  return json({ ok: false, code: "rate_limited", error }, 429, { "Retry-After": String(Math.max(1, retryAfter)) });
}

/**
 * Form token: a signed timestamp fetched when the visitor focuses the email field. The POST must
 * carry one that is at least MIN_MS old (bots submit instantly) and at most MAX_MS old.
 */
const MIN_MS = 1500;
const MAX_MS = 2 * 60 * 60 * 1000;
const formKey = () => `form.${process.env.ADMIN_SECRET || process.env.PREVIEW_SECRET || "solsjin-dev-only"}`;
const signTs = (ts: string) => createHmac("sha256", formKey()).update(`waitlist.${ts}`).digest("base64url").slice(0, 32);

export function issueFormToken() {
  const ts = String(Date.now());
  return `${ts}.${signTs(ts)}`;
}

export function checkFormToken(token: unknown): "ok" | "missing" | "too_fast" | "expired" {
  if (typeof token !== "string" || token.length > 80) return "missing";
  const [ts, mac] = token.split(".");
  if (!ts || !mac || !/^\d{13}$/.test(ts) || !safeEqual(mac, signTs(ts))) return "missing";
  const age = Date.now() - Number(ts);
  if (age < MIN_MS) return "too_fast";
  if (age > MAX_MS) return "expired";
  return "ok";
}
