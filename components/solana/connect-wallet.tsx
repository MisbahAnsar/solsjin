"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowSquareOutIcon, ArrowsLeftRightIcon, CaretDownIcon, CheckIcon, CopyIcon, SignOutIcon, WalletIcon } from "@phosphor-icons/react";
import { GooFilter, gooStyle, useGooId } from "@/components/motion/goo";
import { useOptionalCluster } from "@/components/providers/cluster";
import { explorerUrl } from "@/lib/solana/clusters";
import { shortenAddress } from "@/lib/solana/format";
import { cn, copyText } from "@/lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { useWalletModal } from "./wallet-modal";
import { WalletAvatar } from "./wallet-avatar";

const PILL_W = 196;
const PILL_H = 44;
const DROP = 40;
const PAD = 28;

type Action = { id: string; label: string; icon: ReactNode; run: () => void | Promise<void>; danger?: boolean };

export type ConnectWalletProps = {
  className?: string;
  /** Label for the disconnected state. */
  label?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

/**
 * Wallet-adapter powered connect button. Disconnected it opens the wallet modal; connected it
 * becomes an ink pill whose actions drip out of it as gooey droplets.
 */
export function ConnectWallet({ className, label = "Connect wallet", size = "md", variant = "primary" }: ConnectWalletProps) {
  const { publicKey, wallet, connecting, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (!connected || !publicKey) {
    return (
      <Button className={className} loading={connecting} onClick={() => setVisible(true)} size={size} variant={variant}>
        {!connecting && <WalletIcon size={size === "sm" ? 14 : 16} weight="duotone" />}
        {connecting ? "Connecting…" : label}
      </Button>
    );
  }

  return (
    <ConnectedPill
      address={publicKey.toBase58()}
      className={className}
      icon={wallet?.adapter.icon}
      name={wallet?.adapter.name ?? "Wallet"}
      onChange={() => setVisible(true)}
      onDisconnect={() => disconnect().catch(() => undefined)}
    />
  );
}

export function ConnectedPill({
  address,
  name,
  icon,
  onChange,
  onDisconnect,
  className,
}: {
  address: string;
  name: string;
  icon?: string;
  onChange: () => void;
  onDisconnect: () => void;
  className?: string;
}) {
  const gooId = useGooId("goo-wallet");
  const reduceMotion = useReducedMotion();
  const cluster = useOptionalCluster()?.cluster ?? "mainnet-beta";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const actions: Action[] = [
    {
      id: "copy",
      label: copied ? "Copied!" : "Copy address",
      icon: copied ? <CheckIcon size={16} weight="bold" /> : <CopyIcon size={16} weight="bold" />,
      run: async () => {
        if (await copyText(address)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }
      },
    },
    {
      id: "explorer",
      label: "View on Explorer",
      icon: <ArrowSquareOutIcon size={16} weight="bold" />,
      run: () => {
        window.open(explorerUrl("address", address, cluster), "_blank", "noopener,noreferrer");
      },
    },
    { id: "change", label: "Change wallet", icon: <ArrowsLeftRightIcon size={16} weight="bold" />, run: () => (setOpen(false), onChange()) },
    { id: "disconnect", label: "Disconnect", icon: <SignOutIcon size={16} weight="bold" />, run: () => (setOpen(false), onDisconnect()), danger: true },
  ];

  const gap = (PILL_W - DROP * actions.length) / (actions.length - 1);
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 22, mass: 0.9 };

  function focusItem(index: number) {
    const next = (index + actions.length) % actions.length;
    setActive(next);
    itemRefs.current[next]?.focus();
  }

  function openMenu(focusIndex = 0) {
    setOpen(true);
    setActive(focusIndex);
    requestAnimationFrame(() => itemRefs.current[focusIndex]?.focus());
  }

  function onTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      openMenu(0);
    }
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(active + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(actions.length - 1);
    } else if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      setOpen(false);
      if (event.key === "Escape") triggerRef.current?.focus();
    }
  }

  return (
    <div className={cn("relative z-30 inline-block", className)} ref={rootRef} style={{ width: PILL_W, height: PILL_H }}>
      <GooFilter blur={7} id={gooId} />
      {/* Goo layer: pill + droplets, filtered together. Sized generously so the filter never clips. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ ...gooStyle(gooId), left: -PAD, top: -PAD, width: PILL_W + PAD * 2, height: PILL_H + DROP + 14 + PAD * 2 }}
      >
        <div className="absolute rounded-full bg-inv" style={{ left: PAD, top: PAD, width: PILL_W, height: PILL_H }} />
        {actions.map((action, index) => (
          <motion.div
            animate={open ? { y: PILL_H + 10, scale: 1 } : { y: 2, scale: 0.6 }}
            className={cn("absolute rounded-full", action.danger ? "bg-[#e5484d]" : "bg-inv")}
            initial={false}
            key={action.id}
            style={{ left: PAD + index * (DROP + gap), top: PAD, width: DROP, height: DROP }}
            transition={{ ...spring, delay: reduceMotion ? 0 : open ? index * 0.045 : (actions.length - index) * 0.03 }}
          />
        ))}
      </div>

      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${name} wallet ${shortenAddress(address)}, open wallet menu`}
        className="relative flex h-11 w-full items-center gap-2.5 rounded-full pl-1.5 pr-3.5 text-inv-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => (open ? setOpen(false) : openMenu(0))}
        onKeyDown={onTriggerKey}
        ref={triggerRef}
        type="button"
      >
        <span className="relative">
          <WalletAvatar address={address} size={32} />
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs
            <img alt="" className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-[4px] ring-2 ring-inv" height={14} src={icon} width={14} />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start leading-none">
          <span className="font-mono text-[13px] font-semibold tracking-[-.02em]">{shortenAddress(address)}</span>
          <span className="mt-1 text-[10px] font-medium text-inv-muted">{name}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-inv-muted" transition={spring}>
          <CaretDownIcon size={14} weight="bold" />
        </motion.span>
      </button>

      <div aria-label="Wallet actions" className="absolute left-0" onKeyDown={onMenuKey} role="menu" style={{ top: PILL_H + 10, width: PILL_W, height: DROP }}>
        {actions.map((action, index) => (
          <motion.button
            animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            aria-label={action.label}
            className={cn(
              "absolute top-0 grid place-items-center rounded-full text-inv-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              action.danger && "text-white",
              !open && "pointer-events-none",
            )}
            initial={false}
            key={action.id}
            onClick={() => action.run()}
            onFocus={() => setActive(index)}
            onMouseEnter={() => setActive(index)}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            role="menuitem"
            style={{ left: index * (DROP + gap), width: DROP, height: DROP }}
            tabIndex={open && active === index ? 0 : -1}
            transition={{ duration: 0.18, delay: open && !reduceMotion ? 0.08 + index * 0.045 : 0 }}
            type="button"
          >
            {action.icon}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-card px-2.5 py-1 text-[11px] font-semibold text-fg shadow-lift"
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            key="caption"
            style={{ top: PILL_H + DROP + 18 }}
          >
            {actions[active]?.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
