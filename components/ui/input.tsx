import type { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-semibold text-fg-soft", className)} {...props} />;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-line-strong bg-card px-3.5 text-sm text-fg shadow-[0_1px_2px_rgb(0_0_0/0.03)] outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-ring focus:ring-4 focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-55 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}

export function FieldHint({ className, tone = "muted", ...props }: HTMLAttributes<HTMLParagraphElement> & { tone?: "muted" | "danger" | "success" }) {
  return (
    <p
      className={cn(
        "text-[11px] leading-4",
        tone === "danger" ? "text-danger" : tone === "success" ? "text-accent" : "text-muted",
        className,
      )}
      {...props}
    />
  );
}
