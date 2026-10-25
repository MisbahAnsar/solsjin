import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#11110f] text-white shadow-[0_2px_0_#00000012] hover:bg-[#292925]",
  secondary: "bg-[#f0efe5] text-[#11110f] hover:bg-[#e8e7dc]",
  outline: "border border-[#deddd2] bg-transparent text-[#22221e] hover:bg-[#f5f4ea]",
  ghost: "bg-transparent text-[#4f4f47] hover:bg-[#f1f0e6] hover:text-[#11110f]",
  danger: "bg-[#b42318] text-white hover:bg-[#912018]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-2 rounded-xl px-3 text-xs",
  md: "min-h-11 gap-2 rounded-[14px] px-4 text-sm",
  lg: "min-h-12 gap-2.5 rounded-2xl px-5 text-sm",
  icon: "size-10 rounded-xl p-0",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16b99a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffff3] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none", variants[variant], sizes[size], className)}
      type={type}
      {...props}
    />
  );
}
