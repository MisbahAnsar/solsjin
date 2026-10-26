import { cn } from "@/lib/utils";

/**
 * solsjin "Sol" mark: a solid sun cut by two horizon lines that widen toward the bottom,
 * tilted 20° clockwise (the rotation is baked into the path).
 * The cuts are real gaps in the path (not painted bars), and the fill follows the inverse
 * theme token, so it reads black in light mode and off-white in dark mode.
 */
export const LOGO_SOL_PATH = "M0.899 18.356A25 25 0 1 1 47.733 35.402ZM0.202 21.827L46.036 38.509A25 25 0 0 1 41.926 43.399L0.207 28.214A25 25 0 0 1 0.202 21.827ZM1.708 34.081L37.006 46.929A25 25 0 0 1 1.708 34.081Z";

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
