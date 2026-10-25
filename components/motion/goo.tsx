"use client";

import { useId } from "react";

/** Stable, CSS-safe id for an SVG filter. */
export function useGooId(prefix = "goo") {
  const id = useId();
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export type GooFilterProps = {
  id: string;
  /**
   * Gaussian blur radius (px). Two shapes melt together once the gap between them drops below
   * roughly 1.6 × blur, so pick it from the gap you want to bridge. Keep it well under the radius
   * of your smallest shape or small shapes will shrink.
   */
  blur?: number;
  /** Alpha multiplier. Higher = harder edge. 18–20 gives a clean, antialiased liquid edge. */
  alpha?: number;
  /** Alpha offset. More negative = thinner necks that snap sooner. -7 / -8 are good defaults. */
  shift?: number;
  /**
   * Union the untouched source back over the goo so separated shapes keep their exact outline:
   * a resting circle is a perfect circle, not a blur-shrunk one. Off for pure metaball art.
   */
  crisp?: boolean;
  /** Extra filter region around the element, as a fraction of its box. Keep the layer padded instead. */
  overflow?: number;
};

/**
 * Metaball ("goo") filter.
 *
 * 1. `feGaussianBlur` spreads the alpha of every shape in the layer so nearby edges overlap.
 * 2. `feColorMatrix` remaps alpha with a steep ramp (`a' = a·alpha + shift`), turning the soft sum
 *    back into a hard, antialiased edge. Where two blurred shapes overlap the sum crosses the
 *    threshold and you get one smooth outline with a liquid neck; pull them apart and it thins and snaps.
 * 3. With `crisp`, the source is unioned back on top, so wherever shapes are apart they keep their
 *    exact geometry and the goo only ever adds the necks between them.
 *
 * Rules that keep it clean:
 * - Everything inside one goo layer is ONE solid colour. Colours blended through the blur fringe.
 *   Put icons, text and accents on a crisp layer above.
 * - Only animate transform / opacity of the shapes. Never animate the filter itself.
 * - Pad the layer by at least 3 × blur so the blur is never clipped by its own box.
 */
export function GooFilter({ id, blur = 8, alpha = 19, shift = -8, crisp = true, overflow = 0.25 }: GooFilterProps) {
  const pct = `${overflow * 100}%`;
  const size = `${100 + overflow * 200}%`;
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
      <defs>
        <filter colorInterpolationFilters="sRGB" height={size} id={id} width={size} x={`-${pct}`} y={`-${pct}`}>
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={blur} />
          <feColorMatrix in="blur" mode="matrix" result="goo" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha} ${shift}`} />
          {crisp ? <feBlend in="SourceGraphic" in2="goo" mode="normal" /> : null}
        </filter>
      </defs>
    </svg>
  );
}

export function gooStyle(id: string) {
  return { filter: `url(#${id})` } as const;
}

/**
 * Liquid springs shared by every gooey surface so motion feels like one material: stiff enough to
 * feel immediate, damped enough that nothing wobbles more than once.
 */
export const liquid = {
  /** Droplets leaving a body: one soft overshoot. */
  body: { type: "spring" as const, stiffness: 380, damping: 26, mass: 0.9 },
  /** The lagging edge / trailing droplet: softer, so the neck stretches before it catches up. */
  trail: { type: "spring" as const, stiffness: 260, damping: 26, mass: 1 },
  /** The leading edge of small controls (tabs). */
  snap: { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.8 },
  /** Absorbing back into a body: critically damped, no bounce. */
  absorb: { type: "spring" as const, stiffness: 420, damping: 40, mass: 0.9 },
};
