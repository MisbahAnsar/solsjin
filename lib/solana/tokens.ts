export type TokenInfo = {
  symbol: string;
  name: string;
  /** Mainnet mint address. Native SOL uses the wrapped SOL mint. */
  mint: string;
  decimals: number;
  /** Two brand colours used to render the token mark without remote images. */
  colors: [string, string];
  logoURI?: string;
  tags?: string[];
};

export const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

export const TOKENS: TokenInfo[] = [
  { symbol: "SOL", name: "Solana", mint: NATIVE_SOL_MINT, decimals: 9, colors: ["#9945ff", "#14f195"], tags: ["native"] },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, colors: ["#2775ca", "#5fa8ff"], tags: ["stablecoin"] },
  { symbol: "USDT", name: "Tether USD", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, colors: ["#26a17b", "#6fdcb8"], tags: ["stablecoin"] },
  { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6, colors: ["#1fc7d4", "#c7f284"], tags: ["defi"] },
  { symbol: "JTO", name: "Jito", mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", decimals: 9, colors: ["#3c3c3c", "#a1f0c8"], tags: ["defi"] },
  { symbol: "PYTH", name: "Pyth Network", mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", decimals: 6, colors: ["#6e3fd8", "#e6dafe"], tags: ["oracle"] },
  { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, colors: ["#f8a21a", "#ffd76a"], tags: ["meme"] },
  { symbol: "WIF", name: "dogwifhat", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6, colors: ["#b7835c", "#f1d3b5"], tags: ["meme"] },
  { symbol: "mSOL", name: "Marinade staked SOL", mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", decimals: 9, colors: ["#308d8a", "#c2f3e7"], tags: ["lst"] },
  { symbol: "JitoSOL", name: "Jito Staked SOL", mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", decimals: 9, colors: ["#5b7a6b", "#c3f7dd"], tags: ["lst"] },
];

export function findToken(symbolOrMint: string) {
  const key = symbolOrMint.toLowerCase();
  return TOKENS.find((token) => token.symbol.toLowerCase() === key || token.mint.toLowerCase() === key);
}
