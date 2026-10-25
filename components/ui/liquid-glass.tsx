"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

export type GlassMaterial = "clear" | "regular" | "thick";

export type LiquidGlassProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Corner radius in px. Use 9999 for pills. Drives both the shape and the refraction map. */
  radius?: number;
  /**
   * How much of what is underneath shows through.
   * `clear` floats over content (nav bars), `regular` for menus and chips, `thick` for dialogs and
   * sheets where text has to stay readable over anything.
   */
  material?: GlassMaterial;
  /**
   * Bend the backdrop along the rim like a lens (Chromium only, where `backdrop-filter` accepts an
   * SVG filter). Other browsers keep the same blur, tint and highlights without the lensing.
   */
  refraction?: boolean;
  /** Lens strength in px of displacement at the very edge. */
  depth?: number;
  /**
   * Fade the glass in/out with its parent's `hidden` / `shown` variants (for menus, dialogs, toasts).
   * Opacity is applied to each layer separately, never to an ancestor of the blur, so the blur is
   * live on every frame of the fade instead of popping in at the end.
   */
  presence?: boolean;
  /** With `presence`: classes for the wrapper that fades your content (it is a real box). */
  contentClassName?: string;
  as?: ElementType;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className" | "style">;

const fade: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.14, ease: "easeIn" } },
  shown: { opacity: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
};

/* ---------------------------------------------------------------- feature detection */

function subscribe() {
  return () => {};
}

/**
 * Only Chromium renders `backdrop-filter: url(#svg-filter)`. Safari and Firefox either ignore the
 * whole declaration or draw nothing, so lensing is opt-in by engine rather than by `CSS.supports`
 * (which reports true everywhere).
 */
function canRefract() {
  if (typeof navigator === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  return Boolean(brands?.some((entry) => entry.brand === "Chromium"));
}

function useCanRefract(enabled: boolean) {
  const supported = useSyncExternalStore(subscribe, canRefract, () => false);
  return enabled && supported;
}

/* ---------------------------------------------------------------- lens map */

/**
 * Displacement map for a rounded rect: red encodes x, blue encodes y, mid-grey means "don't move".
 * The middle is flat grey, so only a thin band along the rim bends — the lens you see on the edge
 * of a glass pebble — and the content under the centre stays put.
 */
function lensMap(width: number, height: number, radius: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const r = Math.min(radius, h / 2, w / 2);
  const band = Math.max(4, Math.min(h, w) * 0.22);
  const inner = Math.max(0, r - band);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="x" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="y" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#00f"/></linearGradient><filter id="s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(band / 2.6).toFixed(2)}"/></filter></defs><rect width="${w}" height="${h}" fill="#808080"/><rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/><rect width="${w}" height="${h}" rx="${r}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${band}" y="${band}" width="${Math.max(0, w - band * 2)}" height="${Math.max(0, h - band * 2)}" rx="${inner}" fill="#808080" filter="url(#s)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type Size = { width: number; height: number };

function useElementSize(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<Size | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    let last = 0;
    // Throttled: while a surface morphs we refresh the map ~12×/s and once more when it settles,
    // instead of re-rasterising it every frame.
    const commit = () => {
      last = performance.now();
      const width = Math.round(node.offsetWidth);
      const height = Math.round(node.offsetHeight);
      setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      if (performance.now() - last > 80) commit();
      else frame = requestAnimationFrame(() => (frame = requestAnimationFrame(commit)));
    });
    observer.observe(node);
    commit();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled]);

  return [ref, size] as const;
}

/* ---------------------------------------------------------------- component */

/**
 * A pane of liquid glass.
 *
 * Layers, bottom to top, all inside the element's own radius:
 * 1. backdrop — blur + saturation of whatever scrolls underneath (+ an SVG lens on the rim in Chromium)
 * 2. tint — a thin wash of white (light) or ink (dark) so text keeps contrast
 * 3. rim — a 1px specular edge brighter at the top-left, plus a soft inner glow
 * 4. your content
 *
 * The root never gets a filter, opacity or backdrop itself, so it does not become a "backdrop root":
 * other glass inside it (a chip, a menu) still blurs the real page, not an empty box.
 */
export function LiquidGlass({
  children,
  className,
  style,
  radius = 24,
  material = "regular",
  refraction = false,
  depth = 18,
  presence = false,
  contentClassName,
  as: Tag = "div",
  ...rest
}: LiquidGlassProps) {
  const refract = useCanRefract(refraction);
  const [ref, size] = useElementSize(refract);
  const filterId = `lg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const lens = refract && size && size.width > 0 && size.height > 0;

  const Layer = presence ? motion.span : "span";
  const layerProps = presence ? { variants: fade } : {};
  const Content = presence ? motion.div : "div";

  return (
    <Tag
      {...rest}
      className={cn("liquid-glass", className)}
      data-material={material}
      ref={ref}
      style={{ ...style, borderRadius: radius }}
    >
      {lens && (
        <svg aria-hidden="true" className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height={size.height} id={filterId} width={size.width} x="0" y="0">
            <feImage height={size.height} href={lensMap(size.width, size.height, radius)} preserveAspectRatio="none" result="map" width={size.width} x="0" y="0" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={-depth} xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </svg>
      )}
      <Layer
        {...layerProps}
        aria-hidden="true"
        className="lg-backdrop"
        style={lens ? ({ "--lg-lens": `url(#${filterId})` } as CSSProperties) : undefined}
      />
      <Layer {...layerProps} aria-hidden="true" className="lg-tint" />
      <Layer {...layerProps} aria-hidden="true" className="lg-rim" />
      {presence ? (
        <Content className={cn("relative", contentClassName)} variants={fade}>
          {children}
        </Content>
      ) : (
        children
      )}
    </Tag>
  );
}

/**
 * The iOS "scroll edge": a strip at the top of the viewport where content fades into a progressive
 * blur instead of hitting a hard bar. Several masked backdrop layers each blur a little more,
 * so the blur ramps smoothly from 0 at the bottom of the strip to full at the top.
 */
export function ScrollEdge({
  active = true,
  height = 96,
  tint = 0.4,
  variant = "progressive",
  className,
}: {
  active?: boolean;
  /**
   * `progressive`: blur ramps from strong at the top edge to none at the bottom (floating bars).
   * `bar`: one even blur across the strip with a short soft fade at the bottom (full-width headers
   * whose icons sit directly on the material).
   */
  variant?: "progressive" | "bar";
  /** Height of the strip in px. */
  height?: number;
  /** Opacity of the background-colour wash at the very top (fades to 0 at the bottom). */
  tint?: number;
  className?: string;
}) {
  const steps = [1, 2, 4, 8, 14];
  if (variant === "bar") {
    const mask = "linear-gradient(to top, transparent 0, #000 10px, #000 100%)";
    const filter = "blur(16px) saturate(1.6)";
    return (
      <div aria-hidden="true" className={cn("scroll-edge pointer-events-none absolute inset-x-0 top-0", className)} data-active={active} style={{ height }}>
        <span className="scroll-edge-layer" style={{ backdropFilter: filter, WebkitBackdropFilter: filter, maskImage: mask, WebkitMaskImage: mask }} />
        <span
          className="scroll-edge-tint"
          style={{ "--edge-tint": `${Math.round(tint * 100)}%`, maskImage: mask, WebkitMaskImage: mask, background: "color-mix(in oklab, var(--bg) var(--edge-tint), transparent)" } as CSSProperties}
        />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={cn("scroll-edge pointer-events-none absolute inset-x-0 top-0", className)} data-active={active} style={{ height }}>
      {steps.map((blur, index) => {
        const from = (index / steps.length) * 100;
        const to = ((index + 2) / steps.length) * 100;
        const mask = `linear-gradient(to top, transparent ${from}%, #000 ${Math.min(100, (from + to) / 2)}%, #000 100%)`;
        return (
          <span
            className="scroll-edge-layer"
            key={blur}
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
      <span className="scroll-edge-tint" style={{ "--edge-tint": `${Math.round(tint * 100)}%` } as CSSProperties} />
    </div>
  );
}
