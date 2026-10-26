/**
 * Coming-soon gate. ON unless COMING_SOON is explicitly "false", "0" or "off", so a fresh deploy
 * is gated by default. Read at request time by proxy.ts (no rebuild needed, just redeploy/restart).
 */
export function isComingSoon() {
  return !/^(false|0|off|no)$/i.test((process.env.COMING_SOON ?? "").trim());
}

export const COMING_SOON_PATH = "/coming-soon";
export const PREVIEW_COOKIE = "solsjin_preview";

/** Paths that stay reachable while gated (besides static files, which the matcher skips). */
export function isAllowedWhileGated(pathname: string) {
  return (
    pathname === COMING_SOON_PATH ||
    pathname.startsWith(`${COMING_SOON_PATH}/`) ||
    pathname === "/admin/launch" ||
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}
