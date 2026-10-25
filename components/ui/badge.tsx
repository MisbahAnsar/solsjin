import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "solana";

const tones: Record<BadgeTone, string> = {
  neutral: "border-[#e5e4da] bg-[#f3f2e9] text-[#5f5f57]",
  success: "border-[#b8ead9] bg-[#e7f8f1] text-[#12765b]",
  warning: "border-[#f2ddb0] bg-[#fff7e5] text-[#9b6500]",
  danger: "border-[#f2c8c4] bg-[#fff0ef] text-[#a52b22]",
  solana: "border-[#c5eee4] bg-[#eaf8f4] text-[#087c6b]",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ className = "", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none", tones[tone], className)}
      {...props}
    />
  );
}
