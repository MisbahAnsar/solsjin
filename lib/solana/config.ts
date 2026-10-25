/**
 * Single source of runtime configuration. Every value is a NEXT_PUBLIC_* env var (inlined at build
 * time) with a working public default, so the app runs with zero setup. See .env.example.
 */
export const RPC_ENDPOINTS = {
  "mainnet-beta": process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
  devnet: process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || "https://api.devnet.solana.com",
  testnet: process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || "https://api.testnet.solana.com",
  localnet: process.env.NEXT_PUBLIC_SOLANA_RPC_LOCALNET || "http://127.0.0.1:8899",
} as const;

/** Jupiter API base. Keyless access on api.jup.ag is rate limited; add a key for production. */
export const JUPITER_API_URL = (process.env.NEXT_PUBLIC_JUPITER_API_URL || "https://api.jup.ag").replace(/\/$/, "");

/** Optional Jupiter API key. It is public (shipped to the browser): use a key scoped for client use. */
export const JUPITER_API_KEY = process.env.NEXT_PUBLIC_JUPITER_API_KEY || "";

export function jupiterHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return JUPITER_API_KEY ? { ...extra, "x-api-key": JUPITER_API_KEY } : extra;
}
