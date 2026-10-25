"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowClockwiseIcon, ImagesIcon, InfoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useWalletAssets } from "./hooks";
import { NftCard } from "./nft-card";

export type NftGalleryProps = {
  /** Owner to display. Defaults to the connected wallet. */
  owner?: string;
  /** Max items to request. */
  limit?: number;
  className?: string;
};

function Skeleton() {
  return (
    <div aria-hidden="true" className="w-full max-w-[300px] rounded-[24px] border border-line bg-card p-2">
      <div className="aspect-square animate-pulse rounded-[18px] bg-bg-muted motion-reduce:animate-none" />
      <div className="mt-3 h-3 w-1/2 animate-pulse rounded-full bg-bg-muted motion-reduce:animate-none" />
      <div className="mb-2 mt-2 h-4 w-3/4 animate-pulse rounded-full bg-bg-muted motion-reduce:animate-none" />
    </div>
  );
}

/**
 * The wallet's real NFTs. Reads Metaplex DAS when the RPC supports it, otherwise lists the
 * NFT mints from token accounts (no metadata) and says so.
 */
export function NftGallery({ owner, limit = 12, className }: NftGalleryProps) {
  const { publicKey } = useWallet();
  const address = owner ?? publicKey?.toBase58() ?? null;
  const { status, assets, source, error, refresh } = useWalletAssets(address, { limit });

  if (!address)
    return (
      <div className={cn("flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line px-6 py-10 text-center", className)}>
        <ImagesIcon className="text-faint" size={28} weight="duotone" />
        <p className="text-sm font-semibold text-fg">Connect a wallet to see its collectibles</p>
      </div>
    );

  return (
    <section aria-busy={status === "loading"} aria-label="Collectibles" className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted">
          {status === "success" ? `${assets.length} item${assets.length === 1 ? "" : "s"}` : status === "loading" ? "Loading collectibles…" : "Collectibles"}
        </p>
        <button
          aria-label="Refresh collectibles"
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-muted transition hover:bg-bg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={refresh}
          type="button"
        >
          <ArrowClockwiseIcon size={13} weight="bold" /> Refresh
        </button>
      </div>

      {source === "token-accounts" && (
        <p className="flex items-start gap-2 rounded-2xl bg-bg-muted px-3 py-2.5 text-[12px] leading-5 text-muted" role="note">
          <InfoIcon className="mt-0.5 shrink-0" size={14} weight="bold" />
          This RPC doesn&apos;t support the DAS API, so these are NFT mints read from token accounts without names or images. Set an RPC with DAS
          (e.g. Helius) in NEXT_PUBLIC_SOLANA_RPC_* for full metadata and compressed NFTs.
        </p>
      )}

      {status === "error" && (
        <p className="rounded-2xl border border-danger/30 px-3 py-2.5 text-[12px] text-danger" role="alert">
          Couldn&apos;t load collectibles: {error}
        </p>
      )}

      <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {status === "loading" && Array.from({ length: 3 }, (_, index) => <Skeleton key={index} />)}
        {status === "success" &&
          assets.map((asset) => <NftCard collection={asset.collection ?? (asset.compressed ? "Compressed" : undefined)} image={asset.image} key={asset.id} mint={asset.id} name={asset.name} />)}
      </div>

      {status === "success" && assets.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line px-6 py-10 text-center">
          <ImagesIcon className="text-faint" size={28} weight="duotone" />
          <p className="text-sm font-semibold text-fg">No collectibles on this cluster</p>
          <p className="text-xs text-muted">NFTs live on one cluster. Try switching networks.</p>
        </div>
      )}
    </section>
  );
}
