import { cn } from "@/lib/utils";

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic gradient avatar for an address: same address, same orb, no network request. */
export function WalletAvatar({ address, size = 32, className }: { address: string; size?: number; className?: string }) {
  const h = hash(address || "solsjin");
  const hueA = h % 360;
  const hueB = (hueA + 60 + ((h >> 9) % 120)) % 360;
  const x = 20 + ((h >> 3) % 60);
  const y = 20 + ((h >> 13) % 60);
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at ${x}% ${y}%, hsl(${hueB} 95% 72%), transparent 62%), linear-gradient(135deg, hsl(${hueA} 85% 58%), hsl(${(hueA + 200) % 360} 80% 42%))`,
      }}
    />
  );
}
