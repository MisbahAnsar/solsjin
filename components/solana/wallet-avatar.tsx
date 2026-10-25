import Image from "next/image";
import { cn } from "@/lib/utils";

/** Profile picture for a connected wallet. Rounded, object-cover, with a subtle ring. */
export function WalletAvatar({
  address,
  size = 32,
  src = "/avatar.jpg",
  className,
}: {
  address: string;
  size?: number;
  src?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-bg-muted ring-1 ring-black/10 dark:ring-white/15", className)}
      data-address={address || undefined}
      style={{ width: size, height: size }}
    >
      <Image alt="" className="size-full rounded-full object-cover" draggable={false} height={size} sizes={`${size}px`} src={src} width={size} />
    </span>
  );
}
