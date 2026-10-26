/**
 * Coming-soon gate. ON unless COMING_SOON is explicitly "false", "0" or "off", so a fresh deploy
 * is gated by default. Read at build time by next.config.ts, so changing it needs a redeploy.
 */
export function isComingSoon() {
  return !/^(false|0|off|no)$/i.test((process.env.COMING_SOON ?? "").trim());
}

export const COMING_SOON_PATH = "/coming-soon";
export const PREVIEW_COOKIE = "solsjin_preview";
