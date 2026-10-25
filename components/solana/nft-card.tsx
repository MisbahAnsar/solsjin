"use client";

import { useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowSquareOutIcon, HeartIcon, SealCheckIcon } from "@phosphor-icons/react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { explorerUrl } from "@/lib/solana/clusters";
import { formatAmount, shortenAddress } from "@/lib/solana/format";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { SolanaMark } from "./solana-mark";

export type NftCardProps = {
  name: string;
  collection?: string;
  verified?: boolean;
  /** Image URL. When omitted, deterministic generative art is drawn from `mint`/`name`. */
  image?: string;
  mint?: string;
  /** Listing price in SOL. */
  price?: number;
  attributes?: { trait: string; value: string }[];
  onBuy?: () => void;
  buyLabel?: string;
  className?: string;
};

function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Generative metaball artwork, unique per seed. Pure SVG. */
export function GenerativeArt({ seed, className }: { seed: string; className?: string }) {
  const rand = seeded(seed);
  const hue = Math.floor(rand() * 360);
  const blobs = Array.from({ length: 6 }, () => ({ cx: 15 + rand() * 70, cy: 15 + rand() * 70, r: 10 + rand() * 18, h: (hue + rand() * 120) % 360 }));
  const id = `art-${seed.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "x"}`;
  return (
    <svg aria-hidden="true" className={className} preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100">
      <defs>
        <filter id={`${id}-goo`}>
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" />
        </filter>
        <linearGradient id={`${id}-bg`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 70% 14%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 50) % 360} 60% 6%)`} />
        </linearGradient>
      </defs>
      <rect fill={`url(#${id}-bg)`} height="100" width="100" />
      <g filter={`url(#${id}-goo)`}>
        {blobs.map((blob, index) => (
          <circle cx={blob.cx} cy={blob.cy} fill={`hsl(${blob.h} 92% 64%)`} key={index} r={blob.r} />
        ))}
      </g>
      <g opacity=".18" stroke="white" strokeWidth=".2">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 12.5} x2={i * 12.5} y1="0" y2="100" />
        ))}
      </g>
    </svg>
  );
}

/** NFT tile with tilt-on-hover, verified collection badge, attributes, favourite and buy action. */
export function NftCard({ name, collection, verified, image, mint, price, attributes = [], onBuy, buyLabel = "Buy now", className }: NftCardProps) {
  const reduceMotion = useReducedMotion();
  const cluster = useOptionalCluster()?.cluster ?? "mainnet-beta";
  const [liked, setLiked] = useState(false);
  const [broken, setBroken] = useState<string | null>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 220, damping: 20 });
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgb(255 255 255 / .22), transparent 55%)`);

  return (
    <motion.article
      aria-label={`${name}${collection ? ` from ${collection}` : ""}`}
      className={cn("group relative w-full max-w-[300px] rounded-[24px] border border-line bg-card p-2 shadow-soft [transform-style:preserve-3d]", className)}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left) / rect.width);
        my.set((event.clientY - rect.top) / rect.height);
      }}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
    >
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-bg-muted">
        {image && broken !== image ? (
          // eslint-disable-next-line @next/next/no-img-element -- NFT media comes from arbitrary hosts
          <img alt={name} className="size-full object-cover" decoding="async" loading="lazy" onError={() => setBroken(image)} referrerPolicy="no-referrer" src={image} />
        ) : (
          <GenerativeArt className="size-full" seed={mint ?? name} />
        )}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        <button
          aria-label={liked ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
          aria-pressed={liked}
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55"
          onClick={() => setLiked((v) => !v)}
          type="button"
        >
          <motion.span animate={liked && !reduceMotion ? { scale: [1, 1.35, 1] } : { scale: 1 }} className="grid place-items-center" transition={{ duration: 0.35 }}>
            <HeartIcon className={cn(liked && "text-[#ff5a7a]")} size={17} weight={liked ? "fill" : "bold"} />
          </motion.span>
        </button>
        {attributes.length > 0 && (
          <div className="absolute inset-x-2.5 bottom-2.5 flex flex-wrap gap-1">
            {attributes.slice(0, 3).map((attr) => (
              <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md" key={attr.trait}>
                <span className="text-white/60">{attr.trait}</span> {attr.value}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-2.5 pb-2 pt-3">
        {collection && (
          <p className="flex items-center gap-1 text-[11px] font-semibold text-muted">
            {collection}
            {verified && (
              <SealCheckIcon aria-label="Verified collection" className="text-[#3c8dff]" size={13} weight="fill" />
            )}
          </p>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-[-.02em] text-fg">{name}</h3>
          {mint && (
            <a
              aria-label={`View ${name} on Solana Explorer`}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-faint transition hover:text-fg"
              href={explorerUrl("token", mint, cluster)}
              rel="noreferrer"
              target="_blank"
            >
              {shortenAddress(mint, 3)}
              <ArrowSquareOutIcon size={10} />
            </a>
          )}
        </div>
        {(price !== undefined || onBuy) && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            {price !== undefined && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.08em] text-faint">Price</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold tabular-nums text-fg">
                  <SolanaMark bare iconClassName="h-3 w-3.5" /> {formatAmount(price)} SOL
                </p>
              </div>
            )}
            {onBuy && (
              <Button onClick={onBuy} size="sm">
                {buyLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
