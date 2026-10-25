"use client";

import { type KeyboardEvent, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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

type Rect = { left: number; width: number };

/**
 * Segmented control whose selection indicator is a liquid blob. A trailing droplet follows
 * the indicator on a softer spring, and the SVG goo filter melts them together mid-flight.
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
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const node = itemRefs.current.get(value);
    if (!node) return;
    setRect({ left: node.offsetLeft, width: node.offsetWidth });
  }, [value]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
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
  const stiff = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.8 };
  const soft = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 170, damping: 20, mass: 1 };

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
      <GooFilter blur={6} id={gooId} />
      {/* Gooey layer: only shapes live here so text stays razor sharp in the layer above. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-1 -z-10" style={gooStyle(gooId)}>
        {rect && (
          <>
            <motion.span
              animate={{ x: rect.left - 4, width: rect.width }}
              className={cn("absolute top-0 rounded-full bg-inv", height)}
              initial={false}
              transition={stiff}
            />
            <motion.span
              animate={{ x: rect.left - 4 + rect.width / 2 - 9 }}
              className={cn("absolute rounded-full bg-inv", size === "sm" ? "top-[7px] size-[18px]" : "top-[11px] size-[18px]")}
              initial={false}
              transition={soft}
            />
          </>
        )}
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
            {...tabProps}
            className={cn(
              "relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
              height,
              fill && "flex-1",
              selected ? "text-inv-fg" : "text-muted hover:text-fg",
              !rect && selected && "rounded-full bg-inv",
            )}
            disabled={option.disabled}
            key={option.value}
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
