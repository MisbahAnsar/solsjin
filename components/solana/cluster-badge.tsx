import { Badge, type BadgeProps } from "../ui/badge";

export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";

const clusterLabels: Record<SolanaCluster, string> = {
  "mainnet-beta": "Mainnet",
  devnet: "Devnet",
  testnet: "Testnet",
  localnet: "Localnet",
};

const clusterTones: Record<SolanaCluster, NonNullable<BadgeProps["tone"]>> = {
  "mainnet-beta": "success",
  devnet: "solana",
  testnet: "warning",
  localnet: "neutral",
};

export function ClusterBadge({ cluster, className = "" }: { cluster: SolanaCluster; className?: string }) {
  return (
    <Badge className={className} tone={clusterTones[cluster]}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {clusterLabels[cluster]}
    </Badge>
  );
}
