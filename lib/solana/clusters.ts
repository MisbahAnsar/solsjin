import { RPC_ENDPOINTS } from "./config";

export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";

export type ClusterInfo = {
  value: SolanaCluster;
  label: string;
  short: string;
  endpoint: string;
  /** Whether the cluster supports `requestAirdrop`. */
  faucet: boolean;
};

export const CLUSTERS: Record<SolanaCluster, ClusterInfo> = {
  "mainnet-beta": {
    value: "mainnet-beta",
    label: "Mainnet Beta",
    short: "Mainnet",
    endpoint: RPC_ENDPOINTS["mainnet-beta"],
    faucet: false,
  },
  devnet: {
    value: "devnet",
    label: "Devnet",
    short: "Devnet",
    endpoint: RPC_ENDPOINTS.devnet,
    faucet: true,
  },
  testnet: {
    value: "testnet",
    label: "Testnet",
    short: "Testnet",
    endpoint: RPC_ENDPOINTS.testnet,
    faucet: true,
  },
  localnet: {
    value: "localnet",
    label: "Localnet",
    short: "Local",
    endpoint: RPC_ENDPOINTS.localnet,
    faucet: true,
  },
};

export const CLUSTER_ORDER: SolanaCluster[] = ["mainnet-beta", "devnet", "testnet", "localnet"];

export function isSolanaCluster(value: unknown): value is SolanaCluster {
  return typeof value === "string" && value in CLUSTERS;
}

export type ExplorerKind = "tx" | "address" | "block" | "token";

/** Build a Solana Explorer URL for a signature, address or block on a given cluster. */
export function explorerUrl(kind: ExplorerKind, value: string, cluster: SolanaCluster = "mainnet-beta") {
  const path = kind === "token" ? "address" : kind;
  const base = `https://explorer.solana.com/${path}/${encodeURIComponent(value)}`;
  if (cluster === "mainnet-beta") return base;
  if (cluster === "localnet") {
    return `${base}?cluster=custom&customUrl=${encodeURIComponent(CLUSTERS.localnet.endpoint)}`;
  }
  return `${base}?cluster=${cluster}`;
}
