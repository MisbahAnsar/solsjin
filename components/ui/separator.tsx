import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Separator({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-orientation="horizontal" className={cn("h-px w-full bg-[#eeede5]", className)} role="separator" {...props} />;
}
