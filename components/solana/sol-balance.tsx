import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SolanaMark } from "./solana-mark";

export function SolBalance({
  amount,
  change,
  label = "SOL balance",
  className = "",
}: {
  amount: string;
  change?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-[28px] font-semibold tracking-[-.06em] tabular-nums">{amount} <span className="text-base tracking-[-.03em] text-[#77766e]">SOL</span></CardTitle>
        </div>
        <SolanaMark />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-[11px] text-[#85847c]">Solana native asset</span>
        {change && <span className="rounded-full bg-[#eaf8f4] px-2.5 py-1 text-[11px] font-semibold text-[#087c6b]">{change}</span>}
      </CardContent>
    </Card>
  );
}
