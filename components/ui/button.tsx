import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-inv text-inv-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.12)] hover:opacity-90",
  secondary: "bg-bg-muted text-fg hover:bg-line",
  outline: "border border-line-strong bg-card text-fg shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-bg-subtle",
  ghost: "bg-transparent text-muted hover:bg-bg-muted hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
  accent:
    "bg-[linear-gradient(135deg,#9945ff,#3c8dff_45%,#14f195)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_24px_-10px_#9945ff] hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-[10px] px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-2xl px-5 text-[15px]",
  icon: "size-10 rounded-xl p-0",
  "icon-sm": "size-8 rounded-[10px] p-0",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets `aria-busy` and disables the button. */
  loading?: boolean;
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-semibold tracking-[-.01em] no-underline transition-[background-color,color,box-shadow,transform,opacity,filter] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ className, variant = "primary", size = "md", type = "button", loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
