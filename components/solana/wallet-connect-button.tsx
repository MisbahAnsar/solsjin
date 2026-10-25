import { AddressDisplay } from "./address-display";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export type WalletConnection = {
  name: string;
  address: string;
};

export type WalletConnectButtonProps = (
  | {
      state: "disconnected";
      onConnect: () => void | Promise<void>;
      wallet?: never;
      onDisconnect?: never;
    }
  | {
      state: "connecting";
      onConnect?: never;
      wallet?: never;
      onDisconnect?: never;
    }
  | {
      state: "connected";
      wallet: WalletConnection;
      onDisconnect?: () => void | Promise<void>;
      onConnect?: never;
    }
) & { className?: string };

export function WalletConnectButton({ state, wallet, onConnect, onDisconnect, className = "" }: WalletConnectButtonProps) {
  if (state === "connected") {
    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <div className="flex min-h-11 items-center gap-3 rounded-[14px] border border-[#e5e4da] bg-white px-3.5">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#33c999] opacity-25 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-[#19a779]" />
          </span>
          <span className="text-xs font-semibold text-[#2f2f2a]">{wallet.name}</span>
          <span aria-hidden="true" className="h-4 w-px bg-[#e7e6dc]" />
          <AddressDisplay address={wallet.address} />
        </div>
        {onDisconnect && (
          <Button onClick={onDisconnect} size="sm" variant="outline">Disconnect</Button>
        )}
      </div>
    );
  }

  return (
    <Button aria-busy={state === "connecting"} className={className} disabled={state === "connecting"} onClick={onConnect}>
      {state === "connecting" ? <Spinner /> : <WalletIcon />}
      {state === "connecting" ? "Connecting…" : "Connect wallet"}
    </Button>
  );
}

function WalletIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M16 14h5M3 9h18M7 6V4a1 1 0 0 1 1-1h10" /><circle cx="16" cy="14" r=".75" fill="currentColor" /></svg>;
}

function Spinner() {
  return <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />;
}
