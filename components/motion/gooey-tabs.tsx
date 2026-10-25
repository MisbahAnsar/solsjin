"use client";

import { type KeyboardEvent, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { GooFilter, gooStyle, useGooId } from "./goo";

export type GooeyTabOption<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

export type GooeyTabsProps<T extends string> = {
  options: readonly GooeyTabOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** `tabs` renders tablist semantics, `radio` a radiogroup (for settings like clusters). */
  semantics?: "tabs" | "radio";
  ariaLabel: string;
  size?: "sm" | "md";
  /** Stretch options to fill the container. */
  fill?: boolean;
  className?: string;
  /** Optional id prefix so tabs can be linked to panels: `${idPrefix}-tab-${value}`. */
  idPrefix?: string;
};

const LEAD = { type: "spring", stiffness: 560, damping: 40, mass: 0.8 } as const;
const TRAIL = { type: "spring", stiffness: 190, damping: 23, mass: 1 } as const;

/**
 * Segmented control whose indicator is a liquid capsule. Its leading edge snaps to the new tab
 * while the trailing edge follows on a softer spring, so the capsule stretches mid-flight and
 * then pulls itself back into shape. Built from two circles and a bar that only ever move with
 * transforms (no width/left animation), and a light goo pass welds the seams.
 */
export function GooeyTabs<T extends string>({
  options,
  value,
  onValueChange,
  semantics = "tabs",
  ariaLabel,
  size = "md",
  fill = false,
  className,
  idPrefix,
}: GooeyTabsProps<T>) {
  const gooId = useGooId("goo-tabs");
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<T, HTMLButtonElement>());
  const [ready, setReady] = useState(false);
  const capH = size === "sm" ? 32 : 40;
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const placed = useRef(false);
  const barX = useTransform(left, (value) => value + capH / 2);
  const barScale = useTransform(() => Math.max(0, right.get() - left.get() - capH));
  const rightCapX = useTransform(right, (value) => value - capH);

  const measure = useCallback(() => {
    const node = itemRefs.current.get(value);
    if (!node) return;
    // Measured relative to the 4px inset of the goo layer.
    const nextLeft = node.offsetLeft - 4;
    const nextRight = nextLeft + node.offsetWidth;
    if (!placed.current || reduceMotion) {
      left.jump(nextLeft);
      right.jump(nextRight);
      placed.current = true;
      setReady(true);
      return;
    }
    const forward = nextLeft > left.get();
    // Lead edge is stiff, trail edge is soft: the gap between them is the stretch.
    animate(forward ? right : left, forward ? nextRight : nextLeft, LEAD);
    animate(forward ? left : right, forward ? nextLeft : nextRight, TRAIL);
  }, [value, reduceMotion, left, right]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    let first = true;
    const observer = new ResizeObserver(() => {
      // observe() always fires once immediately; ignore it so a tab change keeps its animation.
      if (first) {
        first = false;
        return;
      }
      // Real resizes jump (no animation) so the capsule never lags behind a layout change.
      placed.current = false;
      measure();
    });
    // Watch the tabs too: web fonts or label changes resize them without resizing the list.
    observer.observe(list);
    itemRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [measure]);

  const enabled = options.filter((option) => !option.disabled);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = enabled.findIndex((option) => option.value === value);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % enabled.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = enabled.length - 1;
    const target = enabled[next];
    if (!target) return;
    onValueChange(target.value);
    itemRefs.current.get(target.value)?.focus();
  }

  const height = size === "sm" ? "h-8" : "h-10";

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "relative isolate inline-flex rounded-full border border-line bg-bg-subtle p-1",
        fill && "flex w-full",
        className,
      )}
      onKeyDown={onKeyDown}
      ref={listRef}
      role={semantics === "tabs" ? "tablist" : "radiogroup"}
    >
      <GooFilter alpha={18} blur={3} id={gooId} shift={-7} />
      {/* Indicator layer: one solid colour, transforms only. Labels live in the layer above. */}
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-1 -z-10", !ready && "opacity-0")}
        style={gooStyle(gooId)}
      >
        <motion.span className="absolute left-0 top-0 rounded-full bg-inv will-change-transform" style={{ width: capH, height: capH, x: left }} />
        <motion.span
          className="absolute left-0 top-0 bg-inv will-change-transform"
          style={{ width: 1, height: capH, x: barX, scaleX: barScale, originX: 0 }}
        />
        <motion.span className="absolute left-0 top-0 rounded-full bg-inv will-change-transform" style={{ width: capH, height: capH, x: rightCapX }} />
      </div>
      {options.map((option) => {
        const selected = option.value === value;
        const tabProps =
          semantics === "tabs"
            ? {
                role: "tab" as const,
                "aria-selected": selected,
                id: idPrefix ? `${idPrefix}-tab-${option.value}` : undefined,
                "aria-controls": idPrefix ? `${idPrefix}-panel-${option.value}` : undefined,
              }
            : { role: "radio" as const, "aria-checked": selected };
        return (
          <button
            key={option.value}
            {...tabProps}
            className={cn(
              "relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
              height,
              fill && "flex-1",
              selected ? "text-inv-fg" : "text-muted hover:text-fg",
              !ready && selected && "rounded-full bg-inv",
            )}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            ref={(node) => {
              if (node) itemRefs.current.set(option.value, node);
              else itemRefs.current.delete(option.value);
            }}
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
