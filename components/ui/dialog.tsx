"use client";

import { type ReactNode, useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Hide the visible title (kept for screen readers). */
  hideHeader?: boolean;
  position?: "center" | "top";
};

/** Accessible modal dialog: portal, focus trap, Escape to close, scroll lock and focus restore. */
export function Dialog({ open, onOpenChange, title, description, children, className, hideHeader, position = "center" }: DialogProps) {
  const isClient = useIsClient();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const autofocus = panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel.querySelector<HTMLElement>(FOCUSABLE);
      (autofocus ?? panel).focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onOpenChangeRef.current(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((node) => node.offsetParent !== null);
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-[100] flex justify-center p-4", position === "top" ? "items-start pt-[12vh]" : "items-end sm:items-center")}>
          <motion.div
            animate={{ opacity: 1 }}
            aria-hidden="true"
            className="absolute inset-0 bg-[rgb(8_8_7/0.45)] backdrop-blur-[3px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-describedby={description ? descriptionId : undefined}
            aria-labelledby={titleId}
            aria-modal="true"
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-[26px] border border-line bg-card text-fg shadow-pop outline-none",
              className,
            )}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            ref={panelRef}
            role="dialog"
            tabIndex={-1}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", hideHeader && "sr-only")}>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-[-.02em]" id={titleId}>
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-xs leading-5 text-muted" id={descriptionId}>
                    {description}
                  </p>
                )}
              </div>
              <button
                aria-label="Close dialog"
                className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-bg-muted hover:text-fg"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
