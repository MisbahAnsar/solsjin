"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRightIcon, CheckIcon, InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { GooFilter, gooStyle, useGooId } from "@/components/motion/goo";
import { cn } from "@/lib/utils";

export type ToastStatus = "loading" | "success" | "error" | "info";

export type ToastInput = {
  title: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  action?: { label: string; href?: string; onClick?: () => void };
  /** Milliseconds before auto-dismiss. `loading` toasts never auto-dismiss. Default 5000. */
  duration?: number;
};

export type ToastRecord = ToastInput & { id: string; status: ToastStatus; createdAt: number };

type ToastApi = {
  toast: (input: ToastInput) => string;
  update: (id: string, patch: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
  toasts: ToastRecord[];
};

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((all) => all.filter((item) => item.id !== id));
  }, []);

  const schedule = useCallback(
    (record: Pick<ToastRecord, "id" | "status" | "duration">) => {
      clearTimeout(timers.current.get(record.id));
      if (record.status === "loading") return;
      const ms = record.duration ?? (record.status === "error" ? 8000 : 5000);
      if (ms === Infinity) return;
      timers.current.set(record.id, setTimeout(() => dismiss(record.id), ms));
    },
    [dismiss],
  );

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `t${++counter}`;
      const record: ToastRecord = { ...input, id, status: input.status ?? "info", createdAt: Date.now() };
      setToasts((all) => [...all.slice(-3), record]);
      schedule(record);
      return id;
    },
    [schedule],
  );

  const update = useCallback(
    (id: string, patch: Partial<ToastInput>) => {
      setToasts((all) =>
        all.map((item) => {
          if (item.id !== id) return item;
          const next = { ...item, ...patch, status: patch.status ?? item.status };
          schedule(next);
          return next;
        }),
      );
    },
    [schedule],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toast, update, dismiss, toasts }), [toast, update, dismiss, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster dismiss={dismiss} toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

export function useOptionalToast() {
  return useContext(ToastContext);
}

function Toaster({ toasts, dismiss }: { toasts: ToastRecord[]; dismiss: (id: string) => void }) {
  return (
    <section
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6"
      role="region"
    >
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <ToastView dismiss={dismiss} key={item.id} toast={item} />
        ))}
      </AnimatePresence>
    </section>
  );
}

const iconFor: Record<ToastStatus, ReactNode> = {
  loading: (
    <svg aria-hidden="true" className="size-4 animate-spin [animation-duration:.8s]" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  ),
  success: <CheckIcon size={16} weight="bold" />,
  error: <WarningIcon size={16} weight="bold" />,
  info: <InfoIcon size={16} weight="bold" />,
};

const bubbleColor: Record<ToastStatus, string> = {
  loading: "bg-inv",
  success: "bg-inv",
  error: "bg-inv",
  info: "bg-inv",
};

const iconColor: Record<ToastStatus, string> = {
  loading: "text-inv-fg",
  success: "text-[#14f195] dark:text-[#068a5a]",
  error: "text-[#ff8a75] dark:text-[#c2321f]",
  info: "text-[#b9a4ff] dark:text-[#6a3ff5]",
};

/**
 * A toast is an inverted pill whose status icon sits in a separate droplet. Whenever the status
 * changes, the droplet pulls away from the card and snaps back, melting through the goo filter.
 */
export function ToastView({ toast, dismiss, static: isStatic }: { toast: ToastRecord; dismiss?: (id: string) => void; static?: boolean }) {
  const gooId = useGooId("goo-toast");
  const reduceMotion = useReducedMotion();
  const pull = reduceMotion ? 0 : -16;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="pointer-events-auto relative w-[min(380px,calc(100vw-2rem))] pl-12"
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      initial={isStatic ? false : { opacity: 0, y: 24, scale: 0.96 }}
      layout={!isStatic}
      role={toast.status === "error" ? "alert" : "status"}
      transition={{ type: "spring", stiffness: 460, damping: 34 }}
    >
      <GooFilter blur={7} id={gooId} />
      <div aria-hidden="true" className="pointer-events-none absolute -inset-6" style={gooStyle(gooId)}>
        <div className="absolute inset-6 left-[4.5rem] rounded-[20px] bg-inv" />
        <motion.div
          animate={{ x: [0, pull, 0] }}
          className={cn("absolute left-6 top-6 size-11 rounded-full", bubbleColor[toast.status])}
          key={`${toast.status}-bubble`}
          transition={{ duration: 0.7, times: [0, 0.45, 1], ease: [0.3, 1.4, 0.4, 1] }}
        />
      </div>
      <motion.span
        animate={{ x: [0, pull, 0] }}
        className={cn("absolute left-0 top-0 grid size-11 place-items-center", iconColor[toast.status])}
        key={`${toast.status}-icon`}
        transition={{ duration: 0.7, times: [0, 0.45, 1], ease: [0.3, 1.4, 0.4, 1] }}
      >
        {iconFor[toast.status]}
      </motion.span>
      <div className="relative flex min-h-11 items-start gap-3 py-2.5 pl-1 pr-2 text-inv-fg">
        <div className="min-w-0 flex-1 pt-[1px]">
          <p className="truncate text-[13px] font-semibold tracking-[-.01em]">{toast.title}</p>
          {toast.description && <div className="mt-0.5 text-xs leading-[1.45] text-inv-muted">{toast.description}</div>}
          {toast.action &&
            (toast.action.href ? (
              <a
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-inv-fg/10 px-2.5 py-1 text-[11px] font-semibold text-inv-fg transition hover:bg-inv-fg/20"
                href={toast.action.href}
                rel="noreferrer"
                target="_blank"
              >
                {toast.action.label}
                <ArrowUpRightIcon size={11} weight="bold" />
              </a>
            ) : (
              <button
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-inv-fg/10 px-2.5 py-1 text-[11px] font-semibold text-inv-fg transition hover:bg-inv-fg/20"
                onClick={toast.action.onClick}
                type="button"
              >
                {toast.action.label}
              </button>
            ))}
        </div>
        {dismiss && (
          <button
            aria-label="Dismiss notification"
            className="grid size-7 shrink-0 place-items-center rounded-full text-inv-muted transition hover:bg-inv-fg/10 hover:text-inv-fg"
            onClick={() => dismiss(toast.id)}
            type="button"
          >
            <XIcon size={13} weight="bold" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
