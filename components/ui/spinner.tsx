import { cn } from "@/lib/utils";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn("relative inline-flex size-4", className)} role={label ? "status" : undefined}>
      <svg aria-hidden="true" className="size-full animate-spin [animation-duration:.8s]" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--bg-muted)_25%,var(--line)_50%,var(--bg-muted)_75%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}
