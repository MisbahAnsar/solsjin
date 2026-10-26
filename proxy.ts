import { NextResponse, type NextRequest } from "next/server";
import { COMING_SOON_PATH, PREVIEW_COOKIE, isAllowedWhileGated, isComingSoon } from "@/lib/gate";

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
 * While COMING_SOON is on, every page is rewritten (URL unchanged) to the coming-soon page and every
 * other API returns 404. Nothing is deleted: set COMING_SOON=false and redeploy to open the site.
 * With PREVIEW_SECRET set, visiting /?preview=<secret> sets a cookie that lets you see the full site.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!isComingSoon()) {
    if (pathname === COMING_SOON_PATH) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  const secret = process.env.PREVIEW_SECRET;
  if (secret && secret.length >= 12) {
    const token = await previewToken(secret);
    const offered = searchParams.get("preview");
    if (offered !== null) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("preview");
      const response = NextResponse.redirect(url);
      if (offered === "off") response.cookies.delete(PREVIEW_COOKIE);
      else if (constantTimeEqual(offered, secret))
        response.cookies.set({ name: PREVIEW_COOKIE, value: token, httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 60 * 60 * 24 * 30 });
      return response;
    }
    const cookie = request.cookies.get(PREVIEW_COOKIE)?.value;
    if (cookie && constantTimeEqual(cookie, token)) return NextResponse.next();
  }

  if (isAllowedWhileGated(pathname)) {
    const response = NextResponse.next();
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  }

  const url = request.nextUrl.clone();
  url.pathname = COMING_SOON_PATH;
  url.search = "";
  const response = NextResponse.rewrite(url);
  // Only "/" should be indexed; every other gated URL shows the same page.
  if (pathname !== "/") response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals, Vercel analytics/insights and static files (favicon,
    // icon.svg, fonts, images in /public). Listing extensions keeps .rsc/.html/.json routes gated.
    "/((?!_next/|_vercel/|.*\\.(?:ico|svg|png|jpe?g|gif|webp|avif|woff2?|ttf|otf|webmanifest)$).*)",
  ],
};
