"use client";

import Link from "next/link";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Shape = "pill" | "circle";

type Common = {
  children: ReactNode;
  size?: Size;
  /** `circle` makes a square, icon-only button. Give it an `aria-label`. */
  shape?: Shape;
  /** Rotation period of the chrome rim in seconds while hovered. Paused when idle and under reduced motion. */
  speed?: number;
  className?: string;
};

export type LiquidMetalButtonProps =
  | (Common & { href: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common | "href">)
  | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>);

const sizes: Record<Size, { pill: string; circle: string; rim: string }> = {
  sm: { pill: "h-9 px-4 text-[13px] gap-1.5", circle: "size-9", rim: "p-[1.5px]" },
  md: { pill: "h-11 px-5 text-sm gap-2", circle: "size-11", rim: "p-[2px]" },
  lg: { pill: "h-[52px] px-7 text-[15px] gap-2.5", circle: "size-[52px]", rim: "p-[2px]" },
};

/**
 * A dark glassy button with a fine platinum bezel.
 *
 * The rim is a layered conic chrome edge. It only spins on hover so scroll stays smooth (no SVG
 * filters, no always-on will-change). A specular hotspot follows the pointer via CSS variables.
 */
export function LiquidMetalButton(props: LiquidMetalButtonProps) {
  const { children, size = "md", shape = "pill", speed = 8, className, ...rest } = props;
  const s = sizes[size];

  function track(event: PointerEvent<HTMLElement>) {
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lm-x", `${((event.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--lm-y", `${((event.clientY - r.top) / r.height) * 100}%`);
  }

  const classes = cn(
    "group/lm relative inline-flex shrink-0 select-none rounded-full no-underline outline-none [contain:paint]",
    "shadow-[0_1px_2px_rgb(0_0_0/.08),0_10px_28px_-16px_rgb(0_0_0/.42)]",
    "transition-shadow duration-300 hover:shadow-[0_1px_2px_rgb(0_0_0/.1),0_14px_34px_-16px_rgb(0_0_0/.5)]",
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:pointer-events-none disabled:opacity-50",
    s.rim,
    className,
  );

  const rimRevFactor = 1.45;
  const rimStyle = { "--lm-speed": `${speed}s`, "--lm-speed-rev": `${speed * rimRevFactor}s` } as CSSProperties;

  const inner = (
    <>
      {/* Platinum bezel — CSS only, spins on hover */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full bg-[#161618]" style={rimStyle}>
        <span className="lm-chrome" />
        <span className="lm-chrome lm-chrome-rev" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/.88)_0%,rgb(255_255_255/.2)_16%,transparent_38%,transparent_64%,rgb(0_0_0/.55)_100%)]" />
        <span className="absolute inset-[1px] rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/.2),inset_0_1px_0_rgb(255_255_255/.4),inset_0_-1px_0_rgb(0_0_0/.55)]" />
        <span className="absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(48px_circle_at_var(--lm-x,50%)_var(--lm-y,0%),rgb(255_255_255/.9),transparent_68%)] group-hover/lm:opacity-100" />
      </span>
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-.01em] text-white/88",
          "bg-[linear-gradient(180deg,#262628_0%,#121213_46%,#070707_100%)]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/.16),inset_0_-1px_0_rgb(0_0_0/.65),inset_0_0_0_1px_rgb(255_255_255/.06)]",
          "transition-[color,box-shadow] duration-300 group-hover/lm:text-white",
          "group-active/lm:shadow-[inset_0_2px_6px_rgb(0_0_0/.72),inset_0_0_0_1px_rgb(0_0_0/.5)]",
          "[&_svg]:shrink-0 [&_svg]:opacity-80 [&_svg]:transition-opacity group-hover/lm:[&_svg]:opacity-100",
          shape === "circle" ? cn(s.circle, "p-0") : s.pill,
        )}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-[5%] top-px h-[46%] rounded-full bg-[linear-gradient(180deg,rgb(255_255_255/.14),rgb(255_255_255/0))] [mask-image:linear-gradient(90deg,transparent,#000_18%,#000_82%,transparent)]" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(120px_circle_at_var(--lm-x,50%)_var(--lm-y,50%),rgb(255_255_255/.07),transparent_70%)] group-hover/lm:opacity-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-full -translate-x-full bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/.1)_50%,transparent_70%)] transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover/lm:translate-x-full motion-reduce:hidden"
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
