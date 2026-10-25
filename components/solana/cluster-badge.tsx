"use client";

import { useOptionalCluster } from "@/components/providers/cluster";
import { CLUSTERS, type SolanaCluster } from "@/lib/solana/clusters";
import { Badge, type BadgeProps } from "../ui/badge";

export type { SolanaCluster };

const tones: Record<SolanaCluster, NonNullable<BadgeProps["tone"]>> = {
  "mainnet-beta": "success",
  devnet: "violet",
  testnet: "warning",
  localnet: "neutral",
};

/** Cluster pill. Reads the active cluster from <SolanaProvider> when `cluster` is omitted. */
export function ClusterBadge({ cluster, className, pulse = true }: { cluster?: SolanaCluster; className?: string; pulse?: boolean }) {
  const context = useOptionalCluster();
  const value = cluster ?? context?.cluster ?? "mainnet-beta";
  return (
    <Badge className={className} tone={tones[value]}>
      <span aria-hidden="true" className="relative flex size-1.5">
        {pulse && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40" />}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      {CLUSTERS[value].short}
    </Badge>
  );
}
