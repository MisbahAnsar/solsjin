"use client";

import { GooeyTabs } from "@/components/motion/gooey-tabs";
import { useOptionalCluster } from "@/components/providers/cluster";
import { CLUSTER_ORDER, CLUSTERS, type SolanaCluster } from "@/lib/solana/clusters";

export type ClusterOption = { value: SolanaCluster; label: string };

const defaultOptions: ClusterOption[] = CLUSTER_ORDER.map((value) => ({ value, label: CLUSTERS[value].short }));

export type ClusterSelectorProps = {
  /** Controlled value. Omit to read/write the persisted cluster from <SolanaProvider>. */
  value?: SolanaCluster;
  onValueChange?: (cluster: SolanaCluster) => void;
  options?: readonly ClusterOption[];
  ariaLabel?: string;
  size?: "sm" | "md";
  fill?: boolean;
  className?: string;
};

/**
 * Gooey segmented cluster switcher. Inside <SolanaProvider> it drives the RPC endpoint and is
 * persisted to localStorage, so every balance, airdrop and transaction follows it.
 */
export function ClusterSelector({ value, onValueChange, options = defaultOptions, ariaLabel = "Solana cluster", size = "md", fill, className }: ClusterSelectorProps) {
  const context = useOptionalCluster();
  const current = value ?? context?.cluster ?? "devnet";
  return (
    <GooeyTabs
      ariaLabel={ariaLabel}
      className={className}
      fill={fill}
      onValueChange={(next) => {
        onValueChange?.(next);
        if (value === undefined) context?.setCluster(next);
      }}
      options={options.map((option) => ({
        value: option.value,
        label: option.label,
        icon: <span aria-hidden="true" className={dotClass[option.value]} />,
      }))}
      semantics="radio"
      size={size}
      value={current}
    />
  );
}

const dotClass: Record<SolanaCluster, string> = {
  "mainnet-beta": "size-1.5 rounded-full bg-[#14f195]",
  devnet: "size-1.5 rounded-full bg-[#a98bff]",
  testnet: "size-1.5 rounded-full bg-[#f2b84b]",
  localnet: "size-1.5 rounded-full bg-[#9a998e]",
};
