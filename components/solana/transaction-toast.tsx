"use client";

import { useCallback } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { type ToastRecord, ToastView, useToast } from "@/components/providers/toast";
import { explorerUrl, type SolanaCluster } from "@/lib/solana/clusters";
import { shortenAddress } from "@/lib/solana/format";
import { describeError } from "./hooks";

/**
 * Track any signature with a gooey toast: loading -> confirmed/failed, explorer link included.
 * Use this when the transaction was sent elsewhere (another SDK, a backend, a relayer).
 */
export function useTransactionToast() {
  const { connection } = useConnection();
  const cluster = useOptionalCluster()?.cluster ?? "devnet";
  const { toast, update } = useToast();

  const track = useCallback(
    async (signature: string, { title = "Transaction", timeoutMs = 60_000 }: { title?: string; timeoutMs?: number } = {}) => {
      const href = explorerUrl("tx", signature, cluster);
      const id = toast({ status: "loading", title: `${title}: confirming`, description: shortenAddress(signature, 6), action: { label: "View on Explorer", href } });
      try {
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
          const { value } = await connection.getSignatureStatuses([signature], { searchTransactionHistory: true });
          const status = value[0];
          if (status?.err) throw new Error(`Failed: ${JSON.stringify(status.err)}`);
          if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
            update(id, { status: "success", title: `${title} confirmed`, description: shortenAddress(signature, 6), action: { label: "View on Explorer", href } });
            return true;
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        throw new Error("Timed out waiting for confirmation");
      } catch (error) {
        update(id, { status: "error", title: `${title} failed`, description: describeError(error), action: { label: "View on Explorer", href } });
        return false;
      }
    },
    [cluster, connection, toast, update],
  );

  return { track };
}

export type TransactionToastProps = {
  status: ToastRecord["status"];
  title: string;
  signature?: string;
  description?: string;
  cluster?: SolanaCluster;
  onDismiss?: () => void;
};

/** Static, presentational version of the gooey transaction toast (for docs, stories, custom stacks). */
export function TransactionToast({ status, title, signature, description, cluster = "devnet", onDismiss }: TransactionToastProps) {
  const record: ToastRecord = {
    id: "static",
    createdAt: 0,
    status,
    title,
    description: description ?? (signature ? shortenAddress(signature, 6) : undefined),
    action: signature ? { label: "View on Explorer", href: explorerUrl("tx", signature, cluster) } : undefined,
  };
  return <ToastView dismiss={onDismiss ? () => onDismiss() : undefined} static toast={record} />;
}
