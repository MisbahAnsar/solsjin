import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, isComingSoon } from "@/lib/gate";

async function previewToken(secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("solsjin-preview")));
  return Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The gate itself lives in next.config.ts (CDN rewrites, no per-request work). This proxy only runs
 * for URLs with ?preview=…: /?preview=<PREVIEW_SECRET> sets the preview cookie, ?preview=off clears it.
 */
export async function proxy(request: NextRequest) {
  const offered = request.nextUrl.searchParams.get("preview");
  const secret = process.env.PREVIEW_SECRET;
  if (offered === null || !isComingSoon()) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.searchParams.delete("preview");
  const response = NextResponse.redirect(url);
  if (offered === "off") response.cookies.delete(PREVIEW_COOKIE);
  else if (secret && secret.length >= 12 && constantTimeEqual(offered, secret))
    response.cookies.set({ name: PREVIEW_COOKIE, value: await previewToken(secret), httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export const config = {
  matcher: [{ source: "/((?!_next/|_vercel/|api/).*)", has: [{ type: "query", key: "preview" }] }],
};
