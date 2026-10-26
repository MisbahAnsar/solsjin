import { cn } from "@/lib/utils";

/**
 * solsjin "Sol" mark: a solid sun cut by two horizon lines that widen toward the bottom,
 * tilted 45° clockwise (the rotation is baked into the path).
 * The cuts are real gaps in the path (not painted bars), and the fill follows the inverse
 * theme token, so it reads black in light mode and off-white in dark mode.
 */
export const LOGO_SOL_PATH = "M5.965 8.793A25 25 0 1 1 41.207 44.035ZM3.866 11.645L38.355 46.134A25 25 0 0 1 32.565 48.828L1.172 17.435A25 25 0 0 1 3.866 11.645ZM0.052 23.387L26.613 49.948A25 25 0 0 1 0.052 23.387Z";

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
