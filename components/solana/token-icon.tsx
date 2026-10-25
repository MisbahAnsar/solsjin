import type { TokenInfo } from "@/lib/solana/tokens";
import { cn } from "@/lib/utils";
import { SolanaMark } from "./solana-mark";

/** Token mark drawn from brand colours (no remote images needed). Uses `logoURI` if present. */
export function TokenIcon({ token, size = 28, className }: { token: Pick<TokenInfo, "symbol" | "colors" | "logoURI">; size?: number; className?: string }) {
  if (token.logoURI) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary token CDNs
      <img alt="" className={cn("shrink-0 rounded-full", className)} height={size} src={token.logoURI} width={size} />
    );
  }
  if (token.symbol === "SOL") {
    return (
      <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-full bg-[#0b0b0a]", className)} style={{ width: size, height: size }}>
        <SolanaMark bare iconClassName="h-[45%] w-[52%]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(140deg, ${token.colors[0]}, ${token.colors[1]})` }}
    >
      {token.symbol.replace(/^[a-z]+/, "").slice(0, 1) || token.symbol.slice(0, 1)}
    </span>
  );
}
