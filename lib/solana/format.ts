export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Shorten a base58 address or signature, e.g. `7xKX…eT8y`. */
export function shortenAddress(address: string, chars = 4) {
  const visible = Number.isFinite(chars) ? Math.max(1, Math.floor(chars)) : 4;
  if (address.length <= visible * 2 + 1) return address;
  return `${address.slice(0, visible)}…${address.slice(-visible)}`;
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

/** Cheap structural check. Use `PublicKey` for full validation (done in components). */
export function looksLikeAddress(value: string) {
  return value.length >= 32 && value.length <= 44 && BASE58.test(value);
}

/** Format a token amount for display with sensible precision. */
export function formatAmount(value: number, options: { maxDecimals?: number; minDecimals?: number; compact?: boolean } = {}) {
  const { maxDecimals, minDecimals = 0, compact = false } = options;
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const decimals = maxDecimals ?? (abs === 0 ? 2 : abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 9);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Math.min(minDecimals, decimals),
    notation: compact && abs >= 100_000 ? "compact" : "standard",
  }).format(value);
}

export function formatUsd(value: number) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value !== 0 && Math.abs(value) < 1 ? 4 : 2,
  }).format(value);
}

export function lamportsToSol(lamports: number | bigint) {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/**
 * Convert a user-entered decimal string into base units (bigint) without float rounding.
 * Returns `null` when the string is not a valid amount for the given decimals.
 */
export function parseUnits(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") return null;
  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;
  const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) + BigInt(padded || "0");
}

/** Convert base units into a plain decimal string (no grouping), trimming trailing zeros. */
export function formatUnits(value: bigint, decimals: number) {
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const base = BigInt(10) ** BigInt(decimals);
  const whole = abs / base;
  const fraction = (abs % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

/** Sanitize typing into a decimal field: digits + one dot, capped to `decimals` fraction digits. */
export function sanitizeDecimalInput(raw: string, decimals: number) {
  let next = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const firstDot = next.indexOf(".");
  if (firstDot !== -1) {
    next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, "");
    const [whole, fraction] = next.split(".");
    next = `${whole}.${fraction.slice(0, Math.max(0, decimals))}`;
    if (decimals === 0) next = whole;
  }
  if (/^0\d/.test(next)) next = next.replace(/^0+(?=\d)/, "");
  if (next.startsWith(".")) next = `0${next}`;
  return next;
}

export function relativeTime(from: number, now = Date.now()) {
  const seconds = Math.round((now - from) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}
