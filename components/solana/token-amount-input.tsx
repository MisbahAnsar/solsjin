"use client";

import { type ReactNode, useId, useState } from "react";
import { findToken, type TokenInfo } from "@/lib/solana/tokens";
import { formatAmount, formatUnits, formatUsd, parseUnits, sanitizeDecimalInput } from "@/lib/solana/format";
import { cn } from "@/lib/utils";
import { TokenIcon } from "./token-icon";

export type AmountValidation = { error: string | null; units: bigint | null };

/** Validate a decimal string against a token's decimals and an optional balance. */
export function validateAmount(value: string, { decimals, balance, symbol = "", min }: { decimals: number; balance?: number | string | null; symbol?: string; min?: number }): AmountValidation {
  if (!value) return { error: null, units: null };
  const units = parseUnits(value, decimals);
  if (units === null) return { error: `Enter a valid amount (max ${decimals} decimals)`, units: null };
  if (units === BigInt(0)) return { error: "Amount must be greater than 0", units };
  if (min !== undefined && Number(value) < min) return { error: `Minimum is ${min} ${symbol}`.trim(), units };
  if (balance !== undefined && balance !== null && balance !== "") {
    const balanceUnits = parseUnits(String(balance).replace(/,/g, ""), decimals) ?? parseUnits(Number(balance).toFixed(decimals), decimals);
    if (balanceUnits !== null && units > balanceUnits) return { error: `Insufficient ${symbol} balance`.replace("  ", " "), units };
  }
  return { error: null, units };
}

export type TokenAmountInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Token metadata. Falls back to `symbol` lookup in the built-in token list. */
  token?: TokenInfo;
  symbol?: string;
  decimals?: number;
  /** Available balance in UI units. Enables the Max button and insufficient-balance error. */
  balance?: number | string | null;
  /** Kept back from Max (e.g. SOL for fees). Defaults to 0.002 for SOL, 0 otherwise. */
  reserve?: number;
  usdPrice?: number;
  label?: string;
  /** Replace the token chip, e.g. with a <TokenSelector/>. */
  tokenSlot?: ReactNode;
  /** @deprecated use tokenSlot */
  icon?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  className?: string;
};

export function TokenAmountInput({
  id,
  value,
  onChange,
  token,
  symbol,
  decimals,
  balance,
  reserve,
  usdPrice,
  label = "Amount",
  tokenSlot,
  icon,
  error: externalError,
  disabled,
  readOnly,
  loading,
  className,
}: TokenAmountInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const meta = token ?? (symbol ? findToken(symbol) : undefined) ?? findToken("SOL")!;
  const sym = symbol ?? meta.symbol;
  const dec = decimals ?? meta.decimals;
  const [decimalHint, setDecimalHint] = useState(false);

  const numericBalance = balance === undefined || balance === null || balance === "" ? null : Number(String(balance).replace(/,/g, ""));
  const { error: validationError } = validateAmount(value, { decimals: dec, balance: numericBalance, symbol: sym });
  const error = externalError ?? validationError;
  const keep = reserve ?? (sym === "SOL" ? 0.002 : 0);

  function handleChange(raw: string) {
    const next = sanitizeDecimalInput(raw, dec);
    const typedFraction = raw.replace(/,/g, ".").split(".")[1];
    setDecimalHint(!!typedFraction && typedFraction.replace(/\D/g, "").length > dec);
    onChange(next);
  }

  function setMax() {
    if (numericBalance === null) return;
    const max = Math.max(0, numericBalance - keep);
    const units = parseUnits(max.toFixed(dec), dec) ?? BigInt(0);
    onChange(formatUnits(units, dec));
    setDecimalHint(false);
  }

  const usd = usdPrice && value && !error ? Number(value) * usdPrice : null;

  return (
    <div
      className={cn(
        "group/amount rounded-[20px] border bg-card p-4 transition-[border-color,box-shadow]",
        error ? "border-danger/60 ring-4 ring-danger/10" : "border-line focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-fg-soft" htmlFor={inputId}>
          {label}
        </label>
        {numericBalance !== null && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <span>
              Balance <span className="font-semibold tabular-nums text-fg-soft">{formatAmount(numericBalance)}</span>
            </span>
            {!readOnly && (
              <button
                className="rounded-full bg-bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-soft transition hover:bg-inv hover:text-inv-fg disabled:opacity-40"
                disabled={disabled || numericBalance <= keep}
                onClick={setMax}
                type="button"
              >
                Max
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            aria-describedby={error || decimalHint ? hintId : undefined}
            aria-invalid={!!error || undefined}
            autoComplete="off"
            className="h-12 w-full min-w-0 bg-transparent text-[30px] font-semibold tracking-[-.05em] tabular-nums text-fg outline-none placeholder:text-faint disabled:cursor-not-allowed"
            disabled={disabled}
            id={inputId}
            inputMode="decimal"
            onChange={(event) => handleChange(event.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
            spellCheck={false}
            type="text"
            value={value}
          />
          {loading && <span className="absolute inset-y-2 left-0 w-28 animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--bg-muted)_25%,var(--line)_50%,var(--bg-muted)_75%)] bg-[length:200%_100%]" />}
        </div>
        {tokenSlot ?? (
          <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-bg-subtle pl-1.5 pr-3 text-sm font-semibold text-fg">
            {icon ?? <TokenIcon size={26} token={meta} />}
            {sym}
          </span>
        )}
      </div>
      <div className="mt-1 flex min-h-4 items-center justify-between gap-3 text-[11px]">
        <span className="tabular-nums text-muted">{usd !== null ? `≈ ${formatUsd(usd)}` : "\u00a0"}</span>
        {(error || decimalHint) && (
          <span className={cn("font-medium", error ? "text-danger" : "text-warn")} id={hintId} role={error ? "alert" : undefined}>
            {error ?? `${sym} supports up to ${dec} decimals`}
          </span>
        )}
      </div>
    </div>
  );
}
