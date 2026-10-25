import { cn } from "@/lib/utils";

/** The Solana glyph on an ink tile. Decorative. */
export function SolanaMark({ className, iconClassName, bare = false }: { className?: string; iconClassName?: string; bare?: boolean }) {
  const glyph = (
    <svg aria-hidden="true" className={cn("h-5 w-6", iconClassName)} fill="none" viewBox="0 0 24 20">
      <defs>
        <linearGradient id="solsjin-mark" x1="0" x2="24" y1="20" y2="0">
          <stop stopColor="#9945ff" />
          <stop offset="1" stopColor="#14f195" />
        </linearGradient>
      </defs>
      <path d="M5.1 1.2h17.4l-3.6 3.6H1.5l3.6-3.6Z" fill="url(#solsjin-mark)" />
      <path d="M18.9 8.2H1.5l3.6 3.6h17.4l-3.6-3.6Z" fill="url(#solsjin-mark)" />
      <path d="M5.1 15.2h17.4l-3.6 3.6H1.5l3.6-3.6Z" fill="url(#solsjin-mark)" />
    </svg>
  );
  if (bare) return glyph;
  return (
    <span aria-hidden="true" className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b0b0a] ring-1 ring-white/10", className)}>
      {glyph}
    </span>
  );
}
