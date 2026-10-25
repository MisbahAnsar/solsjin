import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "solana" | "violet" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-bg-muted text-muted",
  success: "border-transparent bg-accent-soft text-accent-fg",
  warning: "border-transparent bg-warn-soft text-warn",
  danger: "border-transparent bg-danger-soft text-danger",
  solana: "border-transparent bg-[linear-gradient(135deg,color-mix(in_oklab,#9945ff_14%,transparent),color-mix(in_oklab,#14f195_18%,transparent))] text-fg",
  violet: "border-transparent bg-violet-soft text-violet",
  outline: "border-line-strong bg-transparent text-muted",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold leading-none tracking-[-.005em] [&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
