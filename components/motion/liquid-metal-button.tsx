"use client";

import Link from "next/link";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type PointerEvent, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Shape = "pill" | "circle";

type Common = {
  children: ReactNode;
  size?: Size;
  /** `circle` makes a square, icon-only button. Give it an `aria-label`. */
  shape?: Shape;
  /** Rotation period of the chrome rim in seconds. Paused under reduced motion. */
  speed?: number;
  className?: string;
};

export type LiquidMetalButtonProps =
  | (Common & { href: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common | "href">)
  | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>);

const sizes: Record<Size, { pill: string; circle: string; rim: string }> = {
  sm: { pill: "h-9 px-4 text-[13px] gap-1.5", circle: "size-9", rim: "p-[2px]" },
  md: { pill: "h-11 px-5 text-sm gap-2", circle: "size-11", rim: "p-[3px]" },
  lg: { pill: "h-[52px] px-7 text-[15px] gap-2.5", circle: "size-[52px]", rim: "p-[3.5px]" },
};

/**
 * A dark, glassy button wrapped in a ring of flowing liquid chrome.
 *
 * The rim is two counter-rotating conic gradients of chrome stops, blended together and pushed
 * through a fractal-noise displacement map, so the reflections ripple like molten metal rather
 * than spin like a rigid ring. A specular hotspot follows the pointer (CSS variables only, no
 * re-renders) and a sheen sweeps across the face on hover. Nothing scales.
 */
export function LiquidMetalButton(props: LiquidMetalButtonProps) {
  const { children, size = "md", shape = "pill", speed = 7, className, ...rest } = props;
  const warpId = `lm-warp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const s = sizes[size];

  function track(event: PointerEvent<HTMLElement>) {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lm-x", `${((event.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--lm-y", `${((event.clientY - r.top) / r.height) * 100}%`);
  }

  const classes = cn(
    "group/lm relative isolate inline-flex shrink-0 select-none rounded-full no-underline outline-none",
    "shadow-[0_1px_1px_rgb(0_0_0/.08),0_6px_14px_-6px_rgb(0_0_0/.35),0_22px_40px_-22px_rgb(0_0_0/.55)]",
    "transition-shadow duration-300 hover:shadow-[0_1px_1px_rgb(0_0_0/.08),0_8px_18px_-6px_rgb(0_0_0/.4),0_28px_50px_-22px_rgb(0_0_0/.6)]",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50",
    s.rim,
    className,
  );

  const inner = (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
        <filter colorInterpolationFilters="sRGB" height="140%" id={warpId} width="140%" x="-20%" y="-20%">
          <feTurbulence baseFrequency="0.018 0.06" numOctaves={2} seed={7} type="fractalNoise" />
          <feDisplacementMap in="SourceGraphic" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* Chrome rim */}
      <span aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden rounded-full bg-[#8d8d92]">
        <span className="absolute inset-0" style={{ filter: `url(#${warpId})` }}>
          <span className="lm-chrome" style={{ animationDuration: `${speed}s` }} />
          <span className="lm-chrome lm-chrome-rev opacity-70 mix-blend-overlay" style={{ animationDuration: `${speed * 1.6}s` }} />
        </span>
        {/* Studio light: bright from above, shadowed below, so the rim reads as polished metal */}
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/.7),transparent_42%,transparent_60%,rgb(0_0_0/.45))] mix-blend-soft-light" />
        {/* Pointer hotspot on the rim */}
        <span className="absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(60px_circle_at_var(--lm-x,50%)_var(--lm-y,0%),rgb(255_255_255/.9),transparent_70%)] group-hover/lm:opacity-100" />
      </span>
      {/* Face */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-.01em] text-white/85",
          "bg-[linear-gradient(180deg,#2a2a2c_0%,#111112_48%,#050505_100%)]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/.14),inset_0_-1px_0_rgb(0_0_0/.6),inset_0_0_0_1px_rgb(0_0_0/.55)]",
          "transition-[color,box-shadow] duration-300 group-hover/lm:text-white",
          "group-active/lm:shadow-[inset_0_2px_6px_rgb(0_0_0/.7),inset_0_0_0_1px_rgb(0_0_0/.6)]",
          "[&_svg]:shrink-0 [&_svg]:opacity-80 [&_svg]:transition-opacity group-hover/lm:[&_svg]:opacity-100",
          shape === "circle" ? cn(s.circle, "p-0") : s.pill,
        )}
      >
        {/* Upper gloss */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[5%] top-px h-[46%] rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/.13),rgb(255_255_255/0))] [mask-image:linear-gradient(90deg,transparent,#000_18%,#000_82%,transparent)]" />
        {/* Pointer glow on the face */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(120px_circle_at_var(--lm-x,50%)_var(--lm-y,50%),rgb(255_255_255/.07),transparent_70%)] group-hover/lm:opacity-100"
        />
        {/* Sheen sweep */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-full -translate-x-full bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/.10)_50%,transparent_70%)] transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover/lm:translate-x-full motion-reduce:hidden"
        />
        <span className="relative inline-flex items-center gap-[inherit] [text-shadow:0_1px_0_rgb(0_0_0/.6)]">{children}</span>
      </span>
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, ...anchor } = rest as Common & { href: string; external?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>;
    if (external) {
      return (
        <a className={classes} href={href} onPointerMove={track} rel="noreferrer" target="_blank" {...anchor}>
          {inner}
        </a>
      );
    }
    return (
      <Link className={classes} href={href} onPointerMove={track} {...anchor}>
        {inner}
      </Link>
    );
  }

  const { type = "button", ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} onPointerMove={track} type={type} {...button}>
      {inner}
    </button>
  );
}
