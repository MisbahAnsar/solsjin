"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { motion, useReducedMotion } from "motion/react";
import { ArrowsDownUpIcon, GearSixIcon, LightningIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { JUPITER_API_URL, jupiterHeaders } from "@/lib/solana/config";
import { formatAmount, formatUnits, parseUnits } from "@/lib/solana/format";
import { findToken, NATIVE_SOL_MINT, TOKENS, type TokenInfo } from "@/lib/solana/tokens";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { describeError, useSendTransaction, useSolBalance, useTokenBalances, useTokenPrices } from "./hooks";
import { TokenAmountInput, validateAmount } from "./token-amount-input";
import { TokenSelector } from "./token-selector";
import { TransactionStatus } from "./transaction-status";
import { useWalletModal } from "./wallet-modal";

const JUP = `${JUPITER_API_URL}/swap/v1`;

export type JupiterQuote = {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: string;
  slippageBps: number;
  routePlan: { percent: number; swapInfo: { label?: string } }[];
};

type QuoteState = { key: string; quote: JupiterQuote | null; error: string | null; at: number };

async function fetchQuote(input: TokenInfo, output: TokenInfo, units: bigint, slippageBps: number, signal: AbortSignal) {
  const url = `${JUP}/quote?inputMint=${input.mint}&outputMint=${output.mint}&amount=${units}&slippageBps=${slippageBps}&restrictIntermediateTokens=true`;
  const res = await fetch(url, { signal, headers: jupiterHeaders() });
  const data = await res.json().catch(() => null);
  if (res.status === 429) throw new Error("Jupiter rate limit reached (429). Wait a moment or add an API key.");
  if (!res.ok || !data || data.error) throw new Error(data?.error ?? `Quote failed (${res.status})`);
  return data as JupiterQuote;
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export type SwapWidgetProps = {
  defaultInput?: string;
  defaultOutput?: string;
  tokens?: TokenInfo[];
  className?: string;
};

/**
 * Jupiter-powered swap: live debounced quotes (any cluster, read-only), route + price impact,
 * slippage control and real execution on mainnet via the connected wallet.
 */
export function SwapWidget({ defaultInput = "SOL", defaultOutput = "USDC", tokens = TOKENS, className }: SwapWidgetProps) {
  const reduceMotion = useReducedMotion();
  const clusterContext = useOptionalCluster();
  const cluster = clusterContext?.cluster ?? "mainnet-beta";
  const { publicKey, connected, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const [input, setInput] = useState<TokenInfo>(() => findToken(defaultInput) ?? tokens[0]);
  const [output, setOutput] = useState<TokenInfo>(() => findToken(defaultOutput) ?? tokens[1]);
  const [amount, setAmount] = useState("0.1");
  const [slippageBps, setSlippageBps] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  const [flips, setFlips] = useState(0);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<QuoteState>({ key: "", quote: null, error: null, at: 0 });
  const tx = useSendTransaction({ label: "Swap" });

  const mainnet = cluster === "mainnet-beta";
  const owner = connected && mainnet ? publicKey : null;
  const sol = useSolBalance(owner, { watch: false });
  const spl = useTokenBalances(owner);
  const prices = useTokenPrices(useMemo(() => [input.mint, output.mint], [input.mint, output.mint]));

  const balanceOf = (token: TokenInfo) => (!owner ? undefined : token.mint === NATIVE_SOL_MINT ? sol.sol : (spl.balances.get(token.mint)?.uiAmount ?? 0));
  const balances = useMemo(() => {
    if (!owner) return undefined;
    const map: Record<string, number> = {};
    for (const token of tokens) map[token.mint] = token.mint === NATIVE_SOL_MINT ? (sol.sol ?? 0) : (spl.balances.get(token.mint)?.uiAmount ?? 0);
    return map;
  }, [owner, tokens, sol.sol, spl.balances]);

  const inputBalance = balanceOf(input);
  const check = validateAmount(amount, { decimals: input.decimals, balance: inputBalance ?? null, symbol: input.symbol });
  const units = amount ? parseUnits(amount, input.decimals) : null;
  const quoteKey = units && units > BigInt(0) ? `${input.mint}|${output.mint}|${units}|${slippageBps}|${tick}` : "";

  useEffect(() => {
    if (!quoteKey || !units) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchQuote(input, output, units, slippageBps, controller.signal)
        .then((quote) => setState({ key: quoteKey, quote, error: null, at: Date.now() }))
        .catch((error) => {
          if (controller.signal.aborted) return;
          const message = describeError(error);
          setState({ key: quoteKey, quote: null, error: /no routes/i.test(message) ? "No route for this pair and size" : message, at: Date.now() });
        });
    }, 380);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [quoteKey, input, output, units, slippageBps]);

  // Refresh quotes every 20s while the user is looking at them.
  useEffect(() => {
    if (!quoteKey || tx.busy) return;
    const timer = setInterval(() => setTick((t) => t + 1), 20_000);
    return () => clearInterval(timer);
  }, [quoteKey, tx.busy]);

  const current = state.key === quoteKey ? state : null;
  const loadingQuote = !!quoteKey && !current;
  const quote = current?.quote ?? (state.key.split("|").slice(0, 4).join("|") === quoteKey.split("|").slice(0, 4).join("|") ? state.quote : null);
  const outDisplay = quote ? formatUnits(BigInt(quote.outAmount), output.decimals) : "";
  const minOut = quote ? Number(formatUnits(BigInt(quote.otherAmountThreshold), output.decimals)) : null;
  const impact = quote ? Number(quote.priceImpactPct) * 100 : 0;
  const rate = quote && Number(amount) > 0 ? Number(outDisplay) / Number(amount) : null;
  const route = quote ? Array.from(new Set(quote.routePlan.map((step) => step.swapInfo.label).filter(Boolean))).join(" → ") : "";

  function flip() {
    setInput(output);
    setOutput(input);
    setAmount(outDisplay ? String(Number(outDisplay).toFixed(Math.min(6, output.decimals))).replace(/\.?0+$/, "") : amount);
    setFlips((n) => n + 1);
  }

  async function execute() {
    if (!connected || !publicKey) return setVisible(true);
    if (!mainnet) return clusterContext?.setCluster("mainnet-beta");
    if (!quote || check.error) return;
    await tx.send(async () => {
      const res = await fetch(`${JUP}/swap`, {
        method: "POST",
        headers: jupiterHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ quoteResponse: quote, userPublicKey: publicKey.toBase58(), wrapAndUnwrapSol: true, dynamicComputeUnitLimit: true, prioritizationFeeLamports: "auto" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.swapTransaction) throw new Error(data?.error ?? "Could not build swap transaction");
      return VersionedTransaction.deserialize(decodeBase64(data.swapTransaction));
    });
    sol.refresh();
    spl.refresh();
  }

  let cta = "Swap";
  if (!connected) cta = "Connect wallet";
  else if (!mainnet) cta = "Switch to Mainnet to swap";
  else if (!amount) cta = "Enter an amount";
  else if (check.error) cta = check.error;
  else if (current?.error) cta = current.error;
  else if (loadingQuote && !quote) cta = "Fetching best route…";
  else if (tx.phase === "signing") cta = "Approve in wallet…";
  else if (tx.phase === "confirming") cta = "Confirming swap…";
  const ctaDisabled = connected && mainnet && (!amount || !!check.error || !!current?.error || !quote || tx.busy || !signTransaction);

  return (
    <section aria-label="Swap tokens" className={cn("w-full max-w-[440px] rounded-[28px] border border-line bg-card p-2 shadow-lift", className)}>
      <header className="flex items-center justify-between px-3 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-[-.02em] text-fg">Swap</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
            <LightningIcon size={10} weight="fill" /> Jupiter
          </span>
        </div>
        <button
          aria-controls="swap-settings"
          aria-expanded={showSettings}
          aria-label="Slippage settings"
          className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-muted transition hover:bg-bg-muted hover:text-fg", showSettings && "bg-bg-muted text-fg")}
          onClick={() => setShowSettings((v) => !v)}
          type="button"
        >
          {slippageBps / 100}% <GearSixIcon size={14} weight="bold" />
        </button>
      </header>
      {showSettings && (
        <div className="mx-1 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg-subtle px-3 py-2.5" id="swap-settings">
          <span className="text-xs font-semibold text-fg-soft">Max slippage</span>
          <div aria-label="Max slippage" className="flex gap-1" role="radiogroup">
            {[10, 50, 100, 300].map((bps) => (
              <button
                aria-checked={slippageBps === bps}
                className={cn("h-7 rounded-full px-2.5 text-[11px] font-semibold transition", slippageBps === bps ? "bg-inv text-inv-fg" : "text-muted hover:bg-bg-muted hover:text-fg")}
                key={bps}
                onClick={() => setSlippageBps(bps)}
                role="radio"
                type="button"
              >
                {bps / 100}%
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="relative flex flex-col gap-1">
        <TokenAmountInput
          balance={inputBalance}
          className="rounded-[22px] bg-bg-subtle"
          label="You pay"
          onChange={setAmount}
          token={input}
          tokenSlot={<TokenSelector balances={balances} disabledMints={[output.mint]} label="Pay with" onValueChange={setInput} tokens={tokens} value={input} />}
          usdPrice={prices[input.mint]}
          value={amount}
        />
        <motion.button
          animate={{ rotate: flips * 180 }}
          aria-label={`Swap direction: pay ${output.symbol}, receive ${input.symbol}`}
          className="absolute left-1/2 top-1/2 z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border-4 border-card bg-bg-muted text-fg transition-colors hover:bg-inv hover:text-inv-fg"
          onClick={flip}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18 }}
          type="button"
        >
          <ArrowsDownUpIcon size={16} weight="bold" />
        </motion.button>
        <TokenAmountInput
          balance={balanceOf(output)}
          className="rounded-[22px] bg-bg-subtle"
          label="You receive"
          loading={loadingQuote && !quote}
          onChange={() => undefined}
          readOnly
          token={output}
          tokenSlot={<TokenSelector balances={balances} disabledMints={[input.mint]} label="Receive" onValueChange={setOutput} tokens={tokens} value={output} />}
          usdPrice={prices[output.mint]}
          value={outDisplay ? String(Number(outDisplay).toFixed(Math.min(6, output.decimals))).replace(/\.?0+$/, "") : ""}
        />
      </div>
      <div aria-live="polite" className="px-3 py-3 text-xs">
        {quote && rate !== null ? (
          <dl className="grid grid-cols-2 gap-y-1.5">
            <dt className="text-muted">Rate</dt>
            <dd className="text-right font-medium tabular-nums text-fg-soft">
              1 {input.symbol} ≈ {formatAmount(rate)} {output.symbol}
            </dd>
            <dt className="text-muted">Minimum received</dt>
            <dd className="text-right font-medium tabular-nums text-fg-soft">
              {minOut !== null ? formatAmount(minOut) : "—"} {output.symbol}
            </dd>
            <dt className="text-muted">Price impact</dt>
            <dd className={cn("text-right font-medium tabular-nums", impact > 3 ? "text-danger" : impact > 1 ? "text-warn" : "text-accent-fg dark:text-accent")}>
              {impact < 0.01 ? "<0.01" : impact.toFixed(2)}%
            </dd>
            {route && (
              <>
                <dt className="text-muted">Route</dt>
                <dd className="truncate text-right font-medium text-fg-soft" title={route}>
                  {route}
                </dd>
              </>
            )}
          </dl>
        ) : current?.error ? (
          <p className="flex items-center gap-1.5 text-danger" role="alert">
            <WarningCircleIcon size={14} weight="fill" /> {current.error}
          </p>
        ) : (
          <p className="text-muted">{loadingQuote ? "Finding the best route across Solana DEXs…" : "Enter an amount to get a live quote."}</p>
        )}
      </div>
      <Button className="w-full" disabled={ctaDisabled} loading={tx.busy} onClick={execute} size="lg" variant={connected && mainnet ? "accent" : "primary"}>
        {cta}
      </Button>
      {!mainnet && (
        <p className="px-3 pb-1 pt-2.5 text-center text-[11px] text-muted">Quotes are live mainnet prices. Swaps execute on Mainnet only.</p>
      )}
      {tx.phase !== "idle" && <TransactionStatus className="mt-2" error={tx.error} signature={tx.signature} state={tx.phase} title="Swap" />}
    </section>
  );
}
