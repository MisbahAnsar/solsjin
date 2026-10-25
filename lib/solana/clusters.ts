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
    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || "https://api.mainnet-beta.solana.com",
    faucet: false,
  },
  devnet: {
    value: "devnet",
    label: "Devnet",
    short: "Devnet",
    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || "https://api.devnet.solana.com",
    faucet: true,
  },
  testnet: {
    value: "testnet",
    label: "Testnet",
    short: "Testnet",
    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || "https://api.testnet.solana.com",
    faucet: true,
  },
  localnet: {
    value: "localnet",
    label: "Localnet",
    short: "Local",
    endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_LOCALNET || "http://127.0.0.1:8899",
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
