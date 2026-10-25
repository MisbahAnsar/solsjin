"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { CLUSTERS } from "@/lib/solana/clusters";
import { cn } from "@/lib/utils";

type Sample = { endpoint: string; slot: number | null; latency: number | null; ok: boolean };

/** Live RPC health: current slot and round-trip latency, polled every few seconds. */
export function NetworkStatus({ interval = 6000, className }: { interval?: number; className?: string }) {
  const { connection } = useConnection();
  const cluster = useOptionalCluster()?.cluster ?? "devnet";
  const [sample, setSample] = useState<Sample | null>(null);

  useEffect(() => {
    let active = true;
    async function tick() {
      const started = performance.now();
      try {
        const slot = await connection.getSlot("confirmed");
        if (active) setSample({ endpoint: connection.rpcEndpoint, slot, latency: Math.round(performance.now() - started), ok: true });
      } catch {
        if (active) setSample({ endpoint: connection.rpcEndpoint, slot: null, latency: null, ok: false });
      }
    }
    tick();
    const timer = setInterval(tick, interval);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [connection, interval]);

  const current = sample?.endpoint === connection.rpcEndpoint ? sample : null;
  const state = !current ? "checking" : current.ok ? (current.latency! > 900 ? "slow" : "healthy") : "down";
  const color = { checking: "bg-faint", healthy: "bg-accent", slow: "bg-warn", down: "bg-danger" }[state];
  const text = { checking: "Checking RPC…", healthy: "Operational", slow: "Degraded", down: "Unreachable" }[state];

  return (
    <div
      aria-live="polite"
      className={cn("inline-flex h-9 items-center gap-3 rounded-full border border-line bg-card pl-3 pr-3.5 text-xs shadow-soft", className)}
      role="status"
    >
      <span aria-hidden="true" className="relative flex size-2">
        {state === "healthy" && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-40", color)} />}
        <span className={cn("relative inline-flex size-2 rounded-full", color)} />
      </span>
      <span className="font-semibold text-fg">{CLUSTERS[cluster].short}</span>
      <span className="text-muted">{text}</span>
      {current?.ok && (
        <>
          <span aria-hidden="true" className="h-3.5 w-px bg-line" />
          <span className="font-mono tabular-nums text-muted" title="Current slot">
            #{current.slot!.toLocaleString("en-US")}
          </span>
          <span className="font-mono tabular-nums text-muted" title="RPC round-trip">
            {current.latency}ms
          </span>
        </>
      )}
    </div>
  );
}
