import { cn } from "@/lib/utils";
import type { SolanaCluster } from "./cluster-badge";

const clusters: { value: SolanaCluster; label: string }[] = [
  { value: "mainnet-beta", label: "Mainnet" },
  { value: "devnet", label: "Devnet" },
  { value: "testnet", label: "Testnet" },
  { value: "localnet", label: "Localnet" },
];

export function ClusterSelector({
  value,
  onValueChange,
  options = clusters,
  ariaLabel = "Choose Solana cluster",
  className,
}: {
  value: SolanaCluster;
  onValueChange: (cluster: SolanaCluster) => void;
  options?: readonly { value: SolanaCluster; label: string }[];
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div aria-label={ariaLabel} className={cn("flex flex-wrap gap-1 rounded-xl bg-[#f3f2e9] p-1", className)} role="group">
      {options.map((cluster) => (
        <button
          aria-pressed={value === cluster.value}
          className={cn(
            "min-h-9 flex-1 rounded-[9px] px-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16b99a]",
            value === cluster.value ? "bg-white text-[#22221e] shadow-sm" : "text-[#77766e] hover:text-[#22221e]",
          )}
          key={cluster.value}
          onClick={() => onValueChange(cluster.value)}
          type="button"
        >
          {cluster.label}
        </button>
      ))}
    </div>
  );
}
