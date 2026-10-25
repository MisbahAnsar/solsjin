import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: DivProps) {
  return <section className={cn("rounded-[22px] border border-[#e8e6da] bg-white shadow-[0_8px_30px_#1b190b08]", className)} {...props} />;
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={cn("flex flex-col gap-1.5 px-5 pb-4 pt-5 sm:px-6 sm:pt-6", className)} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-[-.02em] text-[#171713]", className)} {...props} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-5 text-[#77766e]", className)} {...props} />;
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}

export function CardFooter({ className = "", ...props }: DivProps) {
  return <div className={cn("flex items-center border-t border-[#eeede5] px-5 py-4 sm:px-6", className)} {...props} />;
}
