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
  return valid ? { ok: true, email } : { ok: false, error: "That doesn't look like a valid email address." };
}

export function cleanSource(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().slice(0, 64).replace(/[^\w\-./:]/g, "");
  return value || null;
}
