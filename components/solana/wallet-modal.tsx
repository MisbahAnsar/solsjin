"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { ArrowClockwiseIcon, ArrowUpRightIcon, CaretRightIcon, GhostIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { Badge, Dialog, Spinner } from "../ui";
import { cn } from "@/lib/utils";

type WalletModalContextValue = { visible: boolean; setVisible: (open: boolean) => void };

const WalletModalContext = createContext<WalletModalContextValue | null>(null);

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) throw new Error("useWalletModal must be used inside <SolanaProvider>.");
  return context;
}

/** Context + modal. Closes itself as soon as the selected wallet connects. */
export function WalletModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const { wallet } = useWallet();

  useEffect(() => {
    const adapter = wallet?.adapter;
    if (!adapter) return;
    const onConnect = () => setVisible(false);
    adapter.on("connect", onConnect);
    return () => {
      adapter.off("connect", onConnect);
    };
  }, [wallet]);

  const value = useMemo(() => ({ visible, setVisible }), [visible]);
  return (
    <WalletModalContext.Provider value={value}>
      {children}
      <WalletModal onOpenChange={setVisible} open={visible} />
    </WalletModalContext.Provider>
  );
}

const SUGGESTED = [
  { name: "Phantom", href: "https://phantom.com/download", colors: ["#ab9ff2", "#7b61ff"] },
  { name: "Solflare", href: "https://solflare.com/download", colors: ["#ffc10b", "#fb3f2e"] },
  { name: "Backpack", href: "https://backpack.app/downloads", colors: ["#ff6464", "#e33e3f"] },
] as const;

function isDetected(wallet: Wallet) {
  return wallet.readyState === WalletReadyState.Installed || wallet.readyState === WalletReadyState.Loadable;
}

export type WalletModalProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { wallets, wallet: selected, select, connect, connecting, connected } = useWallet();
  const [pending, setPending] = useState<WalletName | null>(null);

  const { detected, others } = useMemo(() => {
    const detected: Wallet[] = [];
    const others: Wallet[] = [];
    for (const item of wallets) (isDetected(item) ? detected : others).push(item);
    return { detected, others: others.filter((item) => item.readyState !== WalletReadyState.Unsupported) };
  }, [wallets]);

  const choose = useCallback(
    async (item: Wallet) => {
      setPending(item.adapter.name);
      if (selected?.adapter.name === item.adapter.name && !connected) {
        try {
          await connect();
        } catch {
          // surfaced through WalletProvider onError
        }
        return;
      }
      // Selecting a wallet triggers a (non-silent) connect via the provider's autoConnect.
      select(item.adapter.name);
    },
    [connect, connected, select, selected],
  );

  const busyName = connecting ? (pending ?? selected?.adapter.name ?? null) : null;

  return (
    <Dialog
      description={detected.length ? "Detected via Wallet Standard. Pick one to continue." : undefined}
      onOpenChange={onOpenChange}
      open={open}
      title="Connect a wallet"
    >
      <div className="px-3 pb-3 pt-4">
        {detected.length > 0 ? (
          <ul className="flex flex-col gap-1" role="list">
            {detected.map((item) => (
              <li key={item.adapter.name}>
                <WalletRow busy={busyName === item.adapter.name} disabled={connecting} onSelect={() => choose(item)} tag="Detected" wallet={item} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyWallets />
        )}
        {others.length > 0 && (
          <div className="mt-3 border-t border-line pt-3">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[.08em] text-faint">More options</p>
            <ul className="flex flex-col gap-1" role="list">
              {others.map((item) => (
                <li key={item.adapter.name}>
                  {item.adapter.url ? (
                    <a
                      className="flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-fg transition hover:bg-bg-muted"
                      href={item.adapter.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <WalletIcon wallet={item} />
                      <span className="flex-1">{item.adapter.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        Install <ArrowUpRightIcon size={12} weight="bold" />
                      </span>
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-line bg-bg-subtle px-5 py-3 text-[11px] text-muted">
        <ShieldCheckIcon className="text-accent" size={14} weight="duotone" />
        <span>Connecting only shares your public address. Nothing is signed without your approval.</span>
      </div>
    </Dialog>
  );
}

function WalletIcon({ wallet, className }: { wallet: Wallet; className?: string }) {
  return wallet.adapter.icon ? (
    // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs supplied by the extension
    <img alt="" className={cn("size-9 rounded-xl", className)} height={36} src={wallet.adapter.icon} width={36} />
  ) : (
    <span className={cn("grid size-9 place-items-center rounded-xl bg-bg-muted text-xs font-bold", className)}>{wallet.adapter.name.slice(0, 1)}</span>
  );
}

function WalletRow({ wallet, tag, busy, disabled, onSelect }: { wallet: Wallet; tag: string; busy: boolean; disabled: boolean; onSelect: () => void }) {
  return (
    <button
      aria-busy={busy || undefined}
      className="group flex h-14 w-full items-center gap-3 rounded-2xl px-3 text-left transition hover:bg-bg-muted focus-visible:bg-bg-muted disabled:cursor-wait disabled:opacity-60"
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <WalletIcon wallet={wallet} />
      <span className="flex-1 text-sm font-semibold text-fg">{wallet.adapter.name}</span>
      {busy ? (
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          <Spinner className="size-3.5" /> Approve in wallet
        </span>
      ) : (
        <>
          <Badge tone="success">{tag}</Badge>
          <CaretRightIcon className="text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" size={14} weight="bold" />
        </>
      )}
    </button>
  );
}

export function EmptyWallets() {
  return (
    <div className="flex flex-col items-center px-3 pb-2 pt-2 text-center">
      <div className="relative mb-4 grid size-16 place-items-center rounded-[22px] border border-line bg-bg-subtle">
        <GhostIcon className="text-muted" size={30} weight="duotone" />
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-card bg-warn" />
      </div>
      <p className="text-sm font-semibold">No Solana wallet detected</p>
      <p className="mt-1 max-w-[30ch] text-xs leading-5 text-muted">Install a Wallet Standard compatible wallet, then refresh this page.</p>
      <ul className="mt-5 grid w-full grid-cols-3 gap-2" role="list">
        {SUGGESTED.map((item) => (
          <li key={item.name}>
            <a
              className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-card px-2 py-3 text-xs font-semibold text-fg transition hover:border-line-strong hover:bg-bg-subtle"
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              <span className="size-8 rounded-xl" style={{ background: `linear-gradient(135deg, ${item.colors[0]}, ${item.colors[1]})` }} />
              {item.name}
              <span className="sr-only">(opens download page)</span>
            </a>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-bg-muted hover:text-fg"
        onClick={() => window.location.reload()}
        type="button"
      >
        <ArrowClockwiseIcon size={13} weight="bold" /> I installed one, refresh
      </button>
    </div>
  );
}
