/** Server-side email normalisation and validation (RFC 5321 lengths, pragmatic syntax). */
export function normalizeEmail(input: unknown): { ok: true; email: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: "Enter your email address." };
  const email = input.normalize("NFKC").trim().toLowerCase();
  if (!email) return { ok: false, error: "Enter your email address." };
  if (email.length > 254) return { ok: false, error: "That email address is too long." };
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const valid =
    at > 0 &&
    local.length <= 64 &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..") &&
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
  if (!valid) return { ok: false, error: "That doesn't look like a valid email address." };
  if (isDisposable(domain)) return { ok: false, error: "Please use a permanent email address." };
  return { ok: true, email };
}

export function cleanSource(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().slice(0, 64).replace(/[^\w\-./:]/g, "");
  return value || null;
}

/** Small blocklist of the most common throwaway-inbox domains (exact domain or any subdomain). */
const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamailblock.com", "sharklasers.com", "grr.la",
  "10minutemail.com", "10minutemail.net", "temp-mail.org", "tempmail.com", "tempmail.net", "temp-mail.io", "tempmailo.com",
  "yopmail.com", "yopmail.net", "trashmail.com", "trashmail.de", "getnada.com", "nada.email", "dispostable.com",
  "maildrop.cc", "throwawaymail.com", "fakeinbox.com", "mailnesia.com", "mintemail.com", "mohmal.com", "emailondeck.com",
  "moakt.com", "tempail.com", "tempr.email", "discard.email", "mailcatch.com", "spamgourmet.com", "33mail.com",
  "burnermail.io", "inboxkitten.com", "1secmail.com", "1secmail.net", "1secmail.org", "mail.tm", "mailpoof.com",
  "emailfake.com", "fakemail.net", "byom.de", "spambox.us", "trbvm.com", "dropmail.me", "minuteinbox.com", "tmpmail.org",
  "tmpmail.net", "cock.li", "harakirimail.com", "mailsac.com", "anonaddy.me", "linshiyouxiang.net", "example.com",
]);

export function isDisposable(domain: string) {
  if (DISPOSABLE.has(domain)) return true;
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) if (DISPOSABLE.has(parts.slice(i).join("."))) return true;
  return false;
}
