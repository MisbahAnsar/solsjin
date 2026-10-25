"use client";

import type { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SAMPLE_ADDRESS, SAMPLE_SIGNATURE } from "@/components/docs/demos";
import { AddressDisplay, ClusterSelector, ConnectWallet, NetworkStatus, NftCard, SolBalance, SwapWidget, TransactionToast } from "@/components/solana";
import { cn } from "@/lib/utils";

function Tile({ title, href, children, className }: { title: string; href: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("group relative flex flex-col overflow-hidden rounded-[28px] border border-line bg-card", className)}>
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[12px] font-semibold text-muted">{title}</span>
        <a className="text-[11px] font-semibold text-faint opacity-0 transition group-hover:opacity-100 hover:text-fg focus-visible:opacity-100" href={href}>
          Docs →
        </a>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-5">{children}</div>
    </div>
  );
}

export function Playground() {
  const { publicKey } = useWallet();
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <Tile className="md:col-span-3 md:row-span-2" href="/components/swap-widget" title="Swap · live Jupiter quotes">
        <SwapWidget className="shadow-none" />
      </Tile>
      <Tile className="md:col-span-3" href="/components/connect-wallet" title="Wallet · gooey account menu">
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-4">
          <ConnectWallet size="lg" />
          <AddressDisplay address={publicKey?.toBase58() ?? SAMPLE_ADDRESS} avatar explorer variant="pill" />
        </div>
      </Tile>
      <Tile className="md:col-span-3" href="/components/cluster-selector" title="Network · persisted cluster">
        <div className="flex w-full flex-col items-center gap-4">
          <ClusterSelector />
          <NetworkStatus />
        </div>
      </Tile>
      <Tile className="md:col-span-2" href="/components/sol-balance" title="Balance">
        <SolBalance address={publicKey ?? undefined} amount={publicKey ? undefined : 128.42} change={publicKey ? undefined : "+2.4%"} className="w-full" />
      </Tile>
      <Tile className="md:col-span-2" href="/components/nft-card" title="Collectibles">
        <NftCard className="max-w-[220px]" collection="Solsjin Genesis" mint="GooA1vXQ7mh8jzdQq9RdfHPB2bJ7vJ2Ndr6yrStkq421" name="Goo #0421" verified />
      </Tile>
      <Tile className="md:col-span-2" href="/components/transaction-toast" title="Transactions">
        <div className="flex flex-col items-center gap-2">
          <TransactionToast signature={SAMPLE_SIGNATURE} status="success" title="Swap confirmed" />
          <TransactionToast status="loading" title="Sending 2 SOL…" />
          <TransactionToast status="error" title="Blockhash expired" />
        </div>
      </Tile>
    </div>
  );
}
