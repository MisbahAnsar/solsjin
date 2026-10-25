"use client";

import { useId } from "react";

/** Stable, CSS-safe id for an SVG filter. */
export function useGooId(prefix = "goo") {
  const id = useId();
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export type GooFilterProps = {
  id: string;
  /** Blur radius. Bigger = blobs merge from further away. */
  blur?: number;
  /** Alpha contrast. Bigger = crisper edges. */
  contrast?: number;
  /** Alpha threshold shift (negative). */
  threshold?: number;
};

/**
 * The classic metaball / "gooey" SVG filter: blur the alpha channel, then crush it back
 * with a high-contrast colour matrix so nearby shapes melt into each other.
 * Render once per gooey surface and reference it with `style={{ filter: url(#id) }}`.
 */
export function GooFilter({ id, blur = 8, contrast = 20, threshold = -8 }: GooFilterProps) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
      <defs>
        <filter colorInterpolationFilters="sRGB" id={id}>
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={blur} />
          <feColorMatrix
            in="blur"
            mode="matrix"
            result="goo"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${threshold}`}
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

export function gooStyle(id: string) {
  return { filter: `url(#${id})` } as const;
}
