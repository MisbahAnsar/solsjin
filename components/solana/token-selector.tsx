"use client";

import { useMemo, useState } from "react";
import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { TOKENS, type TokenInfo } from "@/lib/solana/tokens";
import { formatAmount, shortenAddress } from "@/lib/solana/format";
import { cn } from "@/lib/utils";
import { Dialog } from "../ui/dialog";
import { TokenIcon } from "./token-icon";

export type TokenSelectorProps = {
  value: TokenInfo;
  onValueChange: (token: TokenInfo) => void;
  tokens?: TokenInfo[];
  /** Optional balances (UI units) keyed by mint, shown and used for sorting. */
  balances?: Record<string, number>;
  /** Mints that can't be picked (e.g. the other side of a swap). */
  disabledMints?: string[];
  className?: string;
  label?: string;
};

/** Token chip that opens a searchable token picker (symbol, name or mint). Fully keyboard driven. */
export function TokenSelector({ value, onValueChange, tokens = TOKENS, balances, disabledMints = [], className, label = "Select a token" }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? tokens.filter((token) => token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q) || token.mint.toLowerCase() === q)
      : tokens;
    if (!balances) return list;
    return [...list].sort((a, b) => (balances[b.mint] ?? 0) - (balances[a.mint] ?? 0));
  }, [tokens, query, balances]);

  const popular = tokens.slice(0, 4);

  function pick(token: TokenInfo) {
    if (disabledMints.includes(token.mint)) return;
    onValueChange(token);
    setOpen(false);
    setQuery("");
  }

  const listId = "token-selector-results";

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`${label}. Current: ${value.symbol}`}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-bg-subtle pl-1.5 pr-2.5 text-sm font-semibold text-fg transition hover:border-line-strong hover:bg-bg-muted",
          className,
        )}
        onClick={() => {
          setActive(0);
          setOpen(true);
        }}
        type="button"
      >
        <TokenIcon size={26} token={value} />
        {value.symbol}
        <CaretDownIcon className="text-muted" size={12} weight="bold" />
      </button>
      <Dialog className="max-w-[420px]" onOpenChange={setOpen} open={open} title={label}>
        <div className="px-5 pt-4">
          <div className="flex h-11 items-center gap-2.5 rounded-xl border border-line-strong bg-bg-subtle px-3.5 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15">
            <MagnifyingGlassIcon className="text-muted" size={16} />
            <input
              aria-activedescendant={results[active] ? `${listId}-${results[active].mint}` : undefined}
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded="true"
              aria-label="Search tokens by name, symbol or mint"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
              data-autofocus
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((i) => Math.min(results.length - 1, i + 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((i) => Math.max(0, i - 1));
                } else if (event.key === "Enter" && results[active]) {
                  event.preventDefault();
                  pick(results[active]);
                }
              }}
              placeholder="Search name, symbol or paste mint"
              role="combobox"
              value={query}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {popular.map((token) => (
              <button
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border border-line pl-1 pr-2.5 text-xs font-semibold transition hover:border-line-strong hover:bg-bg-muted disabled:opacity-40",
                  token.mint === value.mint && "border-fg/30 bg-bg-muted",
                )}
                disabled={disabledMints.includes(token.mint)}
                key={token.mint}
                onClick={() => pick(token)}
                tabIndex={-1}
                type="button"
              >
                <TokenIcon size={22} token={token} />
                {token.symbol}
              </button>
            ))}
          </div>
        </div>
        <ul aria-label="Tokens" className="scrollbar-thin mt-3 max-h-[340px] overflow-y-auto border-t border-line px-2 py-2" id={listId} role="listbox">
          {results.length === 0 && (
            <li className="flex flex-col items-center px-4 py-10 text-center">
              <MagnifyingGlassIcon className="mb-2 text-faint" size={26} weight="duotone" />
              <p className="text-sm font-semibold">No tokens match “{query}”</p>
              <p className="mt-1 text-xs text-muted">Try a symbol like USDC or paste a full mint address.</p>
            </li>
          )}
          {results.map((token, index) => {
            const disabled = disabledMints.includes(token.mint);
            const selected = token.mint === value.mint;
            return (
              <li
                aria-disabled={disabled || undefined}
                aria-selected={selected}
                className={cn(
                  "flex h-14 cursor-pointer items-center gap-3 rounded-2xl px-3 transition-colors",
                  index === active && "bg-bg-muted",
                  disabled && "cursor-not-allowed opacity-40",
                )}
                id={`${listId}-${token.mint}`}
                key={token.mint}
                onClick={() => pick(token)}
                onMouseMove={() => setActive(index)}
                role="option"
              >
                <TokenIcon size={34} token={token} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                    {token.symbol}
                    {token.tags?.[0] && <span className="rounded-full bg-bg-muted px-1.5 py-px text-[10px] font-medium text-muted">{token.tags[0]}</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {token.name} · <span className="font-mono">{shortenAddress(token.mint, 4)}</span>
                  </p>
                </div>
                {balances?.[token.mint] !== undefined && <span className="text-xs font-semibold tabular-nums text-fg-soft">{formatAmount(balances[token.mint])}</span>}
                {selected && <CheckIcon className="text-accent" size={16} weight="bold" />}
              </li>
            );
          })}
        </ul>
      </Dialog>
    </>
  );
}
