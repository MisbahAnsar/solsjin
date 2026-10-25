"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { animate, AnimatePresence, motion, type MotionValue, motionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowSquareOutIcon, ArrowsLeftRightIcon, CaretDownIcon, CheckIcon, CopyIcon, SignOutIcon, WalletIcon } from "@phosphor-icons/react";
import { GooFilter, gooStyle, liquid, useGooId } from "@/components/motion/goo";
import { useOptionalCluster } from "@/components/providers/cluster";
import { explorerUrl } from "@/lib/solana/clusters";
import { shortenAddress } from "@/lib/solana/format";
import { cn, copyText } from "@/lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { LiquidGlass } from "../ui/liquid-glass";
import { useWalletModal } from "./wallet-modal";
import { WalletAvatar } from "./wallet-avatar";

const PILL_W = 196;
const PILL_H = 44;
const DROP = 40;
/** Space between the pill and the row of droplets at rest. Wider than the goo's reach (≈1.6 × blur), so they separate cleanly. */
const GAP_Y = 18;
const BLUR = 7;
const PAD = BLUR * 4;
/** Droplets start dead-centre inside the pill, fully hidden by it. */
const HIDDEN_Y = (PILL_H - DROP) / 2;
const REST_Y = PILL_H + GAP_Y;
const HIDDEN_SCALE = 0.72;

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
  const reduceMotion = useReducedMotion() ?? false;
  const cluster = useOptionalCluster()?.cluster ?? "mainnet-beta";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [moving, setMoving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const run = useRef(0);
  // One y + scale per droplet, shared by its goo shape and its crisp button so they can never drift
  // apart, and animated outside React so nothing re-renders per frame.
  const [drops] = useState(() =>
    Array.from({ length: 4 }, () => ({ y: motionValue(HIDDEN_Y), scale: motionValue(HIDDEN_SCALE) })),
  );

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
    { id: "change", label: "Change wallet", icon: <ArrowsLeftRightIcon size={16} weight="bold" />, run: () => (toggle(false), onChange()) },
    { id: "disconnect", label: "Disconnect", icon: <SignOutIcon size={16} weight="bold" />, run: () => (toggle(false), onDisconnect()), danger: true },
  ];

  const count = actions.length;
  const gap = (PILL_W - DROP * count) / (count - 1);
  const settled = open && !moving;

  function toggle(next: boolean) {
    setOpen(next);
    const token = ++run.current;
    if (reduceMotion) {
      drops.forEach((drop) => {
        drop.y.jump(next ? REST_Y : HIDDEN_Y);
        drop.scale.jump(next ? 1 : HIDDEN_SCALE);
      });
      setMoving(false);
      return;
    }
    setMoving(true);
    const animations = drops.flatMap((drop, index) => {
      // Open left → right, absorb right → left: the liquid always leaves and returns as a wave.
      const delay = next ? index * 0.04 : (count - 1 - index) * 0.03;
      const spring = next ? liquid.body : liquid.absorb;
      return [
        animate(drop.y, next ? REST_Y : HIDDEN_Y, { ...spring, delay }),
        animate(drop.scale, next ? 1 : HIDDEN_SCALE, { ...spring, delay }),
      ];
    });
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => run.current === token && setMoving(false),
      () => undefined,
    );
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      toggle(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  });

  function focusItem(index: number) {
    const next = (index + count) % count;
    setActive(next);
    itemRefs.current[next]?.focus();
  }

  function openMenu(focusIndex = 0) {
    toggle(true);
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
      focusItem(count - 1);
    } else if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      toggle(false);
      if (event.key === "Escape") triggerRef.current?.focus();
    }
  }

  return (
    <div className={cn("relative z-30 inline-block", className)} ref={rootRef} style={{ width: PILL_W, height: PILL_H }}>
      <GooFilter alpha={19} blur={BLUR} id={gooId} overflow={0} shift={-8} />
      {/*
        Goo layer: ONE solid colour (the pill + four circles). Only their transforms change, so the
        browser just re-runs the filter on a small padded box. Once everything rests the layer hides
        and the crisp buttons (identical geometry) take over, so idle costs nothing.
      */}
      <div
        aria-hidden="true"
        // Shows instantly (a half-faded goo layer would look grey), hides with a short fade.
        className={cn("pointer-events-none absolute", moving ? "opacity-100" : "opacity-0 transition-opacity duration-150 ease-out")}
        style={{ ...gooStyle(gooId), left: -PAD, top: -PAD, width: PILL_W + PAD * 2, height: REST_Y + DROP + PAD * 2 }}
      >
        <div className="absolute rounded-full bg-inv" style={{ left: PAD, top: PAD, width: PILL_W, height: PILL_H }} />
        {drops.map((drop, index) => (
          <motion.div
            className="absolute rounded-full bg-inv will-change-transform"
            key={index}
            style={{ left: PAD + index * (DROP + gap), top: PAD, width: DROP, height: DROP, y: drop.y, scale: drop.scale }}
          />
        ))}
      </div>

      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${name} wallet ${shortenAddress(address)}, open wallet menu`}
        className="relative flex h-11 w-full items-center gap-2.5 rounded-full bg-inv px-1.5 text-inv-fg shadow-[inset_0_1px_0_rgb(255_255_255/.12)] transition-shadow duration-300 hover:shadow-[inset_0_1px_0_rgb(255_255_255/.12),0_10px_30px_-12px_rgb(0_0_0/.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => (open ? toggle(false) : openMenu(0))}
        onKeyDown={onTriggerKey}
        ref={triggerRef}
        type="button"
      >
        <span className="relative grid size-8 shrink-0 place-items-center">
          <WalletAvatar address={address} className="ring-inv-fg/15 dark:ring-inv-fg/15" size={32} />
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs
            <img alt="" className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-[4px] ring-2 ring-inv" height={14} src={icon} width={14} />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start justify-center gap-px text-left">
          <span className="block max-w-full truncate font-mono text-[13px] font-semibold leading-4 tracking-[-.02em]">{shortenAddress(address)}</span>
          <span className="block max-w-full truncate text-[11px] font-medium leading-[14px] text-inv-muted">{name}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="grid size-8 shrink-0 place-items-center text-inv-muted"
          transition={reduceMotion ? { duration: 0 } : liquid.snap}
        >
          <CaretDownIcon size={14} weight="bold" />
        </motion.span>
      </button>

      {/* Crisp layer: the real, perfectly round buttons, riding the exact same motion values. */}
      <div aria-label="Wallet actions" className="absolute left-0 top-0" onKeyDown={onMenuKey} role="menu" style={{ width: PILL_W, height: 0 }}>
        {actions.map((action, index) => (
          <DropletButton
            action={action}
            drop={drops[index]}
            filled={settled || (reduceMotion && open)}
            interactive={open}
            key={action.id}
            left={index * (DROP + gap)}
            onFocus={() => setActive(index)}
            onHover={() => setActive(index)}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            tabIndex={open && active === index ? 0 : -1}
          />
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            animate="shown"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            exit="hidden"
            initial="hidden"
            key="caption"
            style={{ top: REST_Y + DROP + 12 }}
            variants={{
              hidden: { y: -4, transition: { duration: 0.14 } },
              shown: { y: 0, transition: { ...liquid.body, delay: reduceMotion ? 0 : 0.16 } },
            }}
          >
            <LiquidGlass className="whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold text-fg" presence radius={9999}>
              {actions[active]?.label}
            </LiquidGlass>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropletButton({
  action,
  drop,
  left,
  filled,
  interactive,
  tabIndex,
  onFocus,
  onHover,
  ref,
}: {
  action: Action;
  drop: { y: MotionValue<number>; scale: MotionValue<number> };
  left: number;
  filled: boolean;
  interactive: boolean;
  tabIndex: number;
  onFocus: () => void;
  onHover: () => void;
  ref: (node: HTMLButtonElement | null) => void;
}) {
  // Icons surface as the droplet clears the pill, and sink back as it is absorbed.
  const iconOpacity = useTransform(drop.y, [HIDDEN_Y + DROP * 0.55, REST_Y - 4], [0, 1]);
  return (
    <motion.button
      aria-label={action.label}
      className={cn(
        "absolute left-0 top-0 grid place-items-center rounded-full outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        filled
          ? action.danger
            ? "bg-[#e5484d] text-white shadow-[inset_0_1px_0_rgb(255_255_255/.22),0_8px_20px_-10px_rgb(229_72_77/.8)] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#d93d42]"
            : "bg-inv text-inv-fg shadow-[inset_0_1px_0_rgb(255_255_255/.12),0_8px_20px_-12px_rgb(0_0_0/.5)] transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--inv-bg)_84%,var(--inv-fg))]"
          : // Mid-flight the goo below draws the body; fills drop instantly so red never bleeds into it.
            "bg-transparent text-inv-fg",
        !interactive && "pointer-events-none",
      )}
      onClick={() => action.run()}
      onFocus={onFocus}
      onMouseEnter={onHover}
      ref={ref}
      role="menuitem"
      style={{ left, width: DROP, height: DROP, y: drop.y, scale: drop.scale }}
      tabIndex={tabIndex}
      type="button"
    >
      <motion.span className="grid place-items-center" style={{ opacity: iconOpacity }}>
        {action.icon}
      </motion.span>
    </motion.button>
  );
}
