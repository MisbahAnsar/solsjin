import { WalletIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { AddressDisplay } from "./address-display";

export type WalletConnection = { name: string; address: string };

export type WalletConnectButtonProps = (
  | { state: "disconnected"; onConnect: () => void | Promise<void>; wallet?: never; onDisconnect?: never }
  | { state: "connecting"; onConnect?: never; wallet?: never; onDisconnect?: never }
  | { state: "connected"; wallet: WalletConnection; onDisconnect?: () => void | Promise<void>; onConnect?: never }
) & { className?: string };

/**
 * Presentational, fully controlled wallet button. Bring your own wallet state (or use
 * <ConnectWallet/>, which wires this up to wallet-adapter for you).
 */
export function WalletConnectButton({ state, wallet, onConnect, onDisconnect, className }: WalletConnectButtonProps) {
  if (state === "connected") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <div className="flex h-11 items-center gap-2.5 rounded-2xl border border-line bg-card pl-3.5 pr-1 shadow-soft">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-30" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs font-semibold text-fg">{wallet.name}</span>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <AddressDisplay address={wallet.address} />
        </div>
        {onDisconnect && (
          <Button onClick={onDisconnect} size="sm" variant="outline">
            Disconnect
          </Button>
        )}
      </div>
    );
  }
  return (
    <Button className={className} loading={state === "connecting"} onClick={onConnect}>
      {state !== "connecting" && <WalletIcon size={16} weight="duotone" />}
      {state === "connecting" ? "Connecting…" : "Connect wallet"}
    </Button>
  );
}
