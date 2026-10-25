"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { CLUSTERS, type ClusterInfo, isSolanaCluster, type SolanaCluster } from "@/lib/solana/clusters";

export const CLUSTER_STORAGE_KEY = "solsjin-cluster";
const EVENT = "solsjin-cluster-change";
const DEFAULT_CLUSTER: SolanaCluster = "devnet";

function read(): SolanaCluster {
  try {
    const stored = localStorage.getItem(CLUSTER_STORAGE_KEY);
    return isSolanaCluster(stored) ? stored : DEFAULT_CLUSTER;
  } catch {
    return DEFAULT_CLUSTER;
  }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CLUSTER_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENT, callback);
  };
}

type ClusterContextValue = {
  cluster: SolanaCluster;
  info: ClusterInfo;
  endpoint: string;
  setCluster: (cluster: SolanaCluster) => void;
};

const ClusterContext = createContext<ClusterContextValue | null>(null);

/** Persists the selected cluster in localStorage (synced across tabs) and exposes its RPC endpoint. */
export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster = useSyncExternalStore(subscribe, read, () => DEFAULT_CLUSTER);
  const setCluster = useCallback((next: SolanaCluster) => {
    try {
      localStorage.setItem(CLUSTER_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  const value = useMemo(() => ({ cluster, info: CLUSTERS[cluster], endpoint: CLUSTERS[cluster].endpoint, setCluster }), [cluster, setCluster]);
  return <ClusterContext.Provider value={value}>{children}</ClusterContext.Provider>;
}

export function useCluster() {
  const context = useContext(ClusterContext);
  if (!context) throw new Error("useCluster must be used inside <SolanaProvider> or <ClusterProvider>.");
  return context;
}

/** Like useCluster but returns null outside a provider, for components that also work standalone. */
export function useOptionalCluster() {
  return useContext(ClusterContext);
}
