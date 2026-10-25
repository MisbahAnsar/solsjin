import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export type TransactionState = "processing" | "confirmed" | "failed";

const stateCopy: Record<TransactionState, { label: string; tone: "warning" | "success" | "danger"; detail: string }> = {
  processing: { label: "Processing", tone: "warning", detail: "The network is confirming this transaction." },
  confirmed: { label: "Confirmed", tone: "success", detail: "This transaction has been confirmed on-chain." },
  failed: { label: "Failed", tone: "danger", detail: "The transaction was not confirmed." },
};

export function TransactionStatus({
  state,
  signature,
  cluster = "mainnet-beta",
  className = "",
}: {
  state: TransactionState;
  signature?: string;
  cluster?: "mainnet-beta" | "devnet" | "testnet";
  className?: string;
}) {
  const copy = stateCopy[state];
  const explorerUrl = signature
    ? `https://explorer.solana.com/tx/${encodeURIComponent(signature)}${cluster === "mainnet-beta" ? "" : `?cluster=${cluster}`}`
    : undefined;

  return (
    <div aria-live={state === "processing" ? "polite" : undefined} className={cn("flex items-start gap-3 rounded-2xl border border-[#e8e6da] bg-white p-4", className)} role={state === "failed" ? "alert" : "status"}>
      <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${state === "processing" ? "animate-pulse bg-[#d4930a] motion-reduce:animate-none" : state === "confirmed" ? "bg-[#19a779]" : "bg-[#c43b32]"}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#24241f]">Transaction</span>
          <Badge tone={copy.tone}>{copy.label}</Badge>
        </div>
        <p className="mt-1.5 text-[11px] leading-5 text-[#77766e]">{copy.detail}</p>
        {signature && explorerUrl && (
          <a className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#087c6b] underline-offset-4 hover:underline" href={explorerUrl} target="_blank" rel="noreferrer">
            View on Solana Explorer <ExternalLinkIcon />
          </a>
        )}
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return <svg aria-hidden="true" className="size-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5"><path d="M9 2h5v5M14 2 7 9" /><path d="M12 9v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4" /></svg>;
}
