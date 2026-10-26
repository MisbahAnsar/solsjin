import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "solsjin_admin";
/** Admin sessions last 8 hours. */
const MAX_AGE = 60 * 60 * 8;

export function isAdminConfigured() {
  return (process.env.ADMIN_SECRET ?? "").length >= 12;
}

function secret() {
  return process.env.ADMIN_SECRET ?? "";
}

function sign(value: string, key = secret()) {
  return createHmac("sha256", key).update(value).digest("base64url");
}

/** Constant-time comparison of two strings of any length. */
export function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}

export function checkPassword(password: unknown) {
  return isAdminConfigured() && typeof password === "string" && safeEqual(password, secret());
}

export function createSessionValue() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${expires}.${sign(`admin.${expires}`)}`;
}

export function verifySessionValue(value: string | undefined) {
  if (!value || !isAdminConfigured()) return false;
  const [expires, mac] = value.split(".");
  if (!expires || !mac || Number(expires) * 1000 < Date.now()) return false;
  return safeEqual(mac, sign(`admin.${expires}`));
}

export const sessionCookie = {
  name: ADMIN_COOKIE,
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function isAdmin() {
  const jar = await cookies();
  return verifySessionValue(jar.get(ADMIN_COOKIE)?.value);
}

/** Rejects cross-site POSTs (in addition to the SameSite=Strict cookie). Origin is required. */
export function sameOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Unsubscribe tokens: HMAC of the email with ADMIN_SECRET, so links can't be forged. */
export function unsubscribeToken(email: string) {
  return sign(`unsubscribe.${email}`).slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string) {
  return isAdminConfigured() && safeEqual(token, unsubscribeToken(email));
}
