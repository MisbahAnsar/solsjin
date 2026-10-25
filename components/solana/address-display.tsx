"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function shortenAddress(address: string, chars: number) {
  const visibleChars = Number.isFinite(chars) ? Math.max(1, Math.floor(chars)) : 4;
  if (address.length <= visibleChars * 2 + 3) return address;
  return `${address.slice(0, visibleChars)}…${address.slice(-visibleChars)}`;
}

export function AddressDisplay({
  address,
  chars = 4,
  className = "",
}: {
  address: string;
  chars?: number;
  className?: string;
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
  }, []);

  function resetCopyStatusSoon() {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyStatus("idle"), 1600);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
    resetCopyStatusSoon();
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <code className="truncate font-mono text-xs tracking-[-.02em] text-[#4e4e47]" title={address}>
        {shortenAddress(address, chars)}
      </code>
      <button
        aria-label={copyStatus === "copied" ? "Address copied" : copyStatus === "failed" ? "Could not copy address" : "Copy address"}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[#85847c] transition-colors hover:bg-[#f2f1e9] hover:text-[#171713] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16b99a]"
        onClick={copyAddress}
        title={copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Could not copy" : "Copy address"}
        type="button"
      >
        {copyStatus === "copied" ? <CheckIcon /> : <CopyIcon />}
      </button>
      <span aria-live="polite" className="sr-only">{copyStatus === "copied" ? "Address copied to clipboard" : copyStatus === "failed" ? "Could not copy address. Check clipboard permissions." : ""}</span>
    </span>
  );
}

function CopyIcon() {
  return <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" className="size-4 text-[#087c6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6" /></svg>;
}
