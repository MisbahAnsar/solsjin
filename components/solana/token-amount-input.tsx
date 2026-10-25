import type { ReactNode } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { SolanaMark } from "./solana-mark";

export function TokenAmountInput({
  id,
  value,
  onChange,
  symbol = "SOL",
  balance,
  label = "Amount",
  icon,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  symbol?: string;
  balance?: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-[#e3e1d7] bg-white p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-[#34342e]" htmlFor={id}>{label}</label>
        {balance && <span className="text-[11px] text-[#85847c]">Balance <span className="font-medium tabular-nums text-[#55554e]">{balance} {symbol}</span></span>}
      </div>
      <div className="flex items-center gap-3">
        <Input
          className="h-[52px] border-0 bg-transparent px-0 text-[28px] font-medium tracking-[-.05em] shadow-none focus:border-transparent focus:ring-0"
          id={id}
          inputMode="decimal"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          placeholder="0.00"
          step="any"
          type="number"
          value={value}
        />
        <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#f3f2e9] px-3 text-xs font-semibold text-[#34342e]">
          {icon ?? (symbol === "SOL" ? <SolanaMark className="size-5 rounded-full" iconClassName="h-2.5 w-3" /> : <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-[#171713] text-[9px] font-bold text-white">{symbol.slice(0, 1)}</span>)}
          {symbol}
        </span>
      </div>
    </div>
  );
}
