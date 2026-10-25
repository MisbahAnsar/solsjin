import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-semibold text-[#34342e]", className)} {...props} />;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={cn("flex h-11 w-full min-w-0 rounded-xl border border-[#e3e1d7] bg-white px-3.5 text-sm text-[#171713] shadow-[0_1px_2px_#11110f08] outline-none placeholder:text-[#99988f] transition-[border-color,box-shadow] focus:border-[#16a58b] focus:ring-4 focus:ring-[#16a58b]/10 disabled:cursor-not-allowed disabled:bg-[#f5f4ed] disabled:opacity-60", className)}
      {...props}
    />
  );
}
