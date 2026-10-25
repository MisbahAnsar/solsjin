"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletNotReadyError, type WalletError } from "@solana/wallet-adapter-base";
import { MotionConfig } from "motion/react";
import { WalletModalProvider } from "@/components/solana/wallet-modal";
import { ClusterProvider, useCluster } from "./cluster";
import { ToastProvider, useToast } from "./toast";

function WalletLayer({ children }: { children: ReactNode }) {
  const { endpoint } = useCluster();
  const { toast } = useToast();
  // Empty list: Wallet Standard wallets (Phantom, Solflare, Backpack, ...) are detected automatically.
  const wallets = useMemo(() => [], []);
  const onError = useCallback(
    (error: WalletError) => {
      if (error instanceof WalletNotReadyError) return;
      const message = error.message || error.name;
      if (/rejected|declined|cancel/i.test(message)) {
        toast({ status: "info", title: "Request cancelled", description: "You declined the request in your wallet." });
        return;
      }
      toast({ status: "error", title: "Wallet error", description: message });
    },
    [toast],
  );

  return (
    <ConnectionProvider config={{ commitment: "confirmed" }} endpoint={endpoint}>
      <WalletProvider autoConnect onError={onError} wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/**
 * One provider for everything: persisted cluster -> RPC connection -> wallet adapter (Wallet
 * Standard detection, auto reconnect) -> wallet modal -> gooey toasts. Motion respects
 * `prefers-reduced-motion`.
 */
export function SolanaProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ClusterProvider>
        <ToastProvider>
          <WalletLayer>{children}</WalletLayer>
        </ToastProvider>
      </ClusterProvider>
    </MotionConfig>
  );
}
