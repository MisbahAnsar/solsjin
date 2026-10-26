import { cn } from "@/lib/utils";

/**
 * solsjin "Sol" mark: a solid sun cut by two horizon lines that widen toward the bottom.
 * The cuts are real gaps in the path (not painted bars), and the fill follows the inverse
 * theme token, so it reads black in light mode and off-white in dark mode.
 */
export const LOGO_SOL_PATH = "M0.08 27A25 25 0 1 1 49.92 27ZM0.613 30.5H49.387A25 25 0 0 1 47.198 36.5H2.802A25 25 0 0 1 0.613 30.5ZM6.218 41.5H43.782A25 25 0 0 1 6.218 41.5Z";

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={LOGO_SOL_PATH} fill="var(--color-inv)" />
    </svg>
  );
}
