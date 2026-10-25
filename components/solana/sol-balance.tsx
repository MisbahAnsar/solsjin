"use client";

import type { PublicKey } from "@solana/web3.js";
import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { NATIVE_SOL_MINT } from "@/lib/solana/tokens";
import { formatAmount, formatUsd } from "@/lib/solana/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/spinner";
import { useSolBalance, useTokenPrices } from "./hooks";
import { SolanaMark } from "./solana-mark";

export type SolBalanceProps = {
  /** Live mode: fetch + subscribe to this address on the active cluster. */
  address?: string | PublicKey | null;
  /** Static mode: render this amount (string or number of SOL). */
  amount?: string | number;
  /** Static 24h change label, e.g. "+2.4%". */
  change?: string;
  label?: string;
  showUsd?: boolean;
  className?: string;
};

/** SOL balance card. Pass `address` for a live, websocket-updated balance or `amount` for static display. */
export function SolBalance({ address, amount, change, label = "SOL balance", showUsd = true, className }: SolBalanceProps) {
  const live = address !== undefined;
  const balance = useSolBalance(live ? address : null);
  const prices = useTokenPrices(showUsd ? [NATIVE_SOL_MINT] : []);
  const price = prices[NATIVE_SOL_MINT];

  const value = live ? balance.sol : typeof amount === "number" ? amount : amount !== undefined ? Number(amount.replace(/,/g, "")) : null;
  const display = !live && typeof amount === "string" ? amount : value !== null ? formatAmount(value) : null;

  let body;
  if (live && !address) {
    body = <p className="text-sm text-muted">Connect a wallet to see your balance.</p>;
  } else if (live && balance.status === "loading") {
    body = (
      <div aria-label="Loading balance" className="flex flex-col gap-2 pt-1" role="status">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  } else if (live && balance.status === "error") {
    body = (
      <div className="flex items-start gap-2 text-danger" role="alert">
        <WarningCircleIcon className="mt-0.5 shrink-0" size={16} weight="fill" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Couldn&apos;t load balance</p>
          <p className="mt-0.5 text-xs text-muted">{balance.error}</p>
        </div>
      </div>
    );
  } else {
    body = (
      <div>
        <p aria-live="polite" className="text-[30px] font-semibold leading-none tracking-[-.05em] tabular-nums text-fg">
          {display ?? "0"} <span className="text-base font-medium tracking-[-.02em] text-muted">SOL</span>
        </p>
        <p className="mt-2 text-xs tabular-nums text-muted">{price && value !== null ? `≈ ${formatUsd(value * price)}` : "Solana native asset"}</p>
      </div>
    );
  }

  return (
    <section aria-label={label} className={cn("relative overflow-hidden rounded-[22px] border border-line bg-card p-5 shadow-soft", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SolanaMark className="size-9 rounded-xl" iconClassName="h-4 w-5" />
          <span className="text-xs font-semibold text-fg-soft">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {change && <span className="rounded-full bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent-fg">{change}</span>}
          {live && address && (
            <button
              aria-label="Refresh balance"
              className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-bg-muted hover:text-fg disabled:opacity-50"
              disabled={balance.status === "loading"}
              onClick={balance.refresh}
              type="button"
            >
              <ArrowClockwiseIcon className={cn(balance.refreshing && "animate-spin")} size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>
      {body}
    </section>
  );
}
