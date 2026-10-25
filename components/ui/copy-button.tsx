"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { cn, copyText } from "@/lib/utils";

export type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
  /** Visible text next to the icon. */
  children?: ReactNode;
  onCopied?: () => void;
  size?: number;
};

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy(value: string) {
    const ok = await copyText(value);
    if (!ok) return false;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), timeout);
    return true;
  }
  return { copied, copy };
}

export function CopyButton({ value, label = "Copy to clipboard", className, children, onCopied, size = 15 }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  return (
    <button
      aria-label={children ? undefined : copied ? "Copied" : label}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        !children && "size-8",
        className,
      )}
      onClick={async () => {
        if (await copy(value)) onCopied?.();
      }}
      title={label}
      type="button"
    >
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="grid place-items-center"
            exit={{ opacity: 0, scale: 0.4, filter: "blur(2px)" }}
            initial={{ opacity: 0, scale: 0.4, filter: "blur(2px)" }}
            key={copied ? "check" : "copy"}
            transition={{ duration: 0.16 }}
          >
            {copied ? <CheckIcon size={size} weight="bold" /> : <CopyIcon size={size} weight="regular" />}
          </motion.span>
        </AnimatePresence>
      </span>
      {children}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
