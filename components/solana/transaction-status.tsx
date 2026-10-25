"use client";

import { motion } from "motion/react";
import { ArrowSquareOutIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { explorerUrl, type SolanaCluster } from "@/lib/solana/clusters";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { CopyButton } from "../ui/copy-button";
import { shortenAddress } from "@/lib/solana/format";
import type { TxPhase } from "./hooks";

/** Legacy coarse states (still supported) plus the full lifecycle from useSendTransaction. */
export type TransactionState = "processing" | "confirmed" | "failed" | TxPhase;

const STEPS = [
  { key: "signing", label: "Sign" },
  { key: "confirming", label: "Confirm" },
  { key: "confirmed", label: "Finalized" },
] as const;

function normalize(state: TransactionState): TxPhase {
  if (state === "processing") return "confirming";
  return state;
}

const copy: Record<TxPhase, { label: string; tone: "neutral" | "warning" | "success" | "danger"; detail: string }> = {
  idle: { label: "Ready", tone: "neutral", detail: "Nothing sent yet." },
  signing: { label: "Awaiting signature", tone: "warning", detail: "Approve the request in your wallet." },
  confirming: { label: "Confirming", tone: "warning", detail: "Sent. Waiting for the cluster to confirm." },
  confirmed: { label: "Confirmed", tone: "success", detail: "Confirmed on-chain." },
  failed: { label: "Failed", tone: "danger", detail: "The transaction did not land." },
};

export type TransactionStatusProps = {
  state: TransactionState;
  signature?: string | null;
  error?: string | null;
  cluster?: SolanaCluster;
  title?: string;
  className?: string;
};

/** Stepper card for a transaction lifecycle with signature copy + explorer link. */
export function TransactionStatus({ state, signature, error, cluster, title = "Transaction", className }: TransactionStatusProps) {
  const contextCluster = useOptionalCluster()?.cluster;
  const activeCluster = cluster ?? contextCluster ?? "mainnet-beta";
  const phase = normalize(state);
  const info = copy[phase];
  const failedAt = phase === "failed" ? (signature ? 1 : 0) : -1;
  const reached = phase === "confirmed" ? 3 : phase === "confirming" ? 1 : phase === "signing" ? 0 : phase === "failed" ? failedAt : -1;

  return (
    <div
      aria-live="polite"
      className={cn("rounded-[20px] border border-line bg-card p-4 shadow-soft", className)}
      role={phase === "failed" ? "alert" : "status"}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg">{title}</span>
        <Badge tone={info.tone}>{info.label}</Badge>
      </div>
      <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((step, index) => {
          const done = index < reached || (phase === "confirmed" && index <= 2);
          const current = index === reached && phase !== "confirmed" && phase !== "failed";
          const failed = phase === "failed" && index === failedAt;
          return (
            <li aria-current={current ? "step" : undefined} className="flex flex-col gap-2" key={step.key}>
              <span className="relative h-1.5 overflow-hidden rounded-full bg-bg-muted">
                <motion.span
                  animate={{ width: done || failed ? "100%" : current ? "55%" : "0%" }}
                  className={cn("absolute inset-y-0 left-0 rounded-full", failed ? "bg-danger" : done ? "bg-accent" : "bg-warn")}
                  initial={false}
                  transition={{ type: "spring", stiffness: 160, damping: 24 }}
                />
                {current && <span className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)] bg-[length:200%_100%]" />}
              </span>
              <span className={cn("flex items-center gap-1 text-[11px] font-medium", done ? "text-fg-soft" : failed ? "text-danger" : current ? "text-fg" : "text-faint")}>
                {done && <CheckIcon size={11} weight="bold" />}
                {failed && <XIcon size={11} weight="bold" />}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className={cn("mt-3 text-xs leading-5", phase === "failed" ? "text-danger" : "text-muted")}>{phase === "failed" && error ? error : info.detail}</p>
      {signature && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-bg-subtle py-1 pl-3 pr-1">
          <code className="truncate font-mono text-[11px] text-fg-soft" title={signature}>
            {shortenAddress(signature, 8)}
          </code>
          <div className="flex shrink-0 items-center">
            <CopyButton className="size-7 rounded-lg text-muted hover:bg-bg-muted hover:text-fg" label="Copy signature" size={13} value={signature} />
            <a
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-accent-fg transition hover:bg-accent-soft dark:text-accent"
              href={explorerUrl("tx", signature, activeCluster)}
              rel="noreferrer"
              target="_blank"
            >
              Explorer <ArrowSquareOutIcon size={11} weight="bold" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
