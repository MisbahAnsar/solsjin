"use client";

import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { explorerUrl, type SolanaCluster } from "@/lib/solana/clusters";
import { shortenAddress } from "@/lib/solana/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "../ui/copy-button";
import { WalletAvatar } from "./wallet-avatar";

export type AddressDisplayProps = {
  address: string;
  /** Characters kept on each side when truncating. */
  chars?: number;
  /** Show the full address (wraps) instead of truncating. */
  full?: boolean;
  avatar?: boolean;
  copyable?: boolean;
  /** Link to Solana Explorer. Uses the provider's cluster unless `cluster` is passed. */
  explorer?: boolean;
  cluster?: SolanaCluster;
  kind?: "address" | "tx";
  variant?: "plain" | "pill";
  className?: string;
};

export function AddressDisplay({
  address,
  chars = 4,
  full = false,
  avatar = false,
  copyable = true,
  explorer = false,
  cluster,
  kind = "address",
  variant = "plain",
  className,
}: AddressDisplayProps) {
  const context = useOptionalCluster();
  const activeCluster = cluster ?? context?.cluster ?? "mainnet-beta";
  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1.5",
        variant === "pill" && "h-9 rounded-full border border-line bg-card pl-1.5 pr-1 shadow-soft",
        variant === "pill" && !avatar && "pl-3",
        className,
      )}
    >
      {avatar && <WalletAvatar address={address} size={variant === "pill" ? 24 : 20} />}
      <code className={cn("min-w-0 font-mono text-xs tracking-[-.02em] text-fg-soft", full ? "break-all" : "truncate")} title={address}>
        {full ? address : shortenAddress(address, chars)}
      </code>
      {copyable && (
        <CopyButton
          className="size-7 shrink-0 rounded-full text-muted hover:bg-bg-muted hover:text-fg"
          label={kind === "tx" ? "Copy signature" : "Copy address"}
          size={13}
          value={address}
        />
      )}
      {explorer && (
        <a
          aria-label={`View ${kind === "tx" ? "transaction" : "address"} on Solana Explorer (opens in new tab)`}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-bg-muted hover:text-fg"
          href={explorerUrl(kind, address, activeCluster)}
          rel="noreferrer"
          target="_blank"
          title="View on Solana Explorer"
        >
          <ArrowSquareOutIcon size={13} />
        </a>
      )}
    </span>
  );
}
