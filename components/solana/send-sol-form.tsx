"use client";

import { type FormEvent, useId, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FieldHint, Input, Label } from "../ui/input";
import { useSendTransaction, useSolBalance } from "./hooks";
import { TokenAmountInput, validateAmount } from "./token-amount-input";
import { TransactionStatus } from "./transaction-status";
import { useWalletModal } from "./wallet-modal";

function validateRecipient(value: string, self?: string) {
  if (!value) return null;
  try {
    const key = new PublicKey(value.trim());
    if (self && key.toBase58() === self) return "That's your own address";
    return null;
  } catch {
    return "Not a valid Solana address";
  }
}

/** Real SOL transfer: validated recipient + amount, wallet signature, confirmation and toast. */
export function SendSolForm({ className, onSent }: { className?: string; onSent?: (signature: string) => void }) {
  const id = useId();
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const balance = useSolBalance(publicKey);
  const tx = useSendTransaction({ label: "Send SOL" });
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);

  const recipientError = validateRecipient(recipient, publicKey?.toBase58());
  const amountCheck = validateAmount(amount, { decimals: 9, balance: balance.sol, symbol: "SOL" });
  const canSubmit = connected && recipient && amount && !recipientError && !amountCheck.error && amountCheck.units && !tx.busy;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!connected) return setVisible(true);
    if (!canSubmit || !publicKey || !amountCheck.units) return;
    const to = new PublicKey(recipient.trim());
    const lamports = amountCheck.units;
    const signature = await tx.send(() => new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: to, lamports })));
    if (signature) {
      setAmount("");
      balance.refresh();
      onSent?.(signature);
    }
  }

  return (
    <form className={cn("flex flex-col gap-3", className)} noValidate onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-to`}>Recipient</Label>
        <Input
          aria-describedby={recipientError && (touched || recipient.length > 30) ? `${id}-to-hint` : undefined}
          autoComplete="off"
          className="font-mono text-[13px]"
          id={`${id}-to`}
          invalid={!!recipientError && (touched || recipient.length > 30)}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder="Wallet address"
          spellCheck={false}
          value={recipient}
        />
        {recipientError && (touched || recipient.length > 30) && (
          <FieldHint id={`${id}-to-hint`} tone="danger">
            {recipientError}
          </FieldHint>
        )}
      </div>
      <TokenAmountInput balance={connected ? balance.sol : undefined} loading={connected && balance.status === "loading"} onChange={setAmount} symbol="SOL" value={amount} />
      <Button className="w-full" disabled={connected && !canSubmit} loading={tx.busy} size="lg" type="submit">
        {!tx.busy && <PaperPlaneTiltIcon size={17} weight="duotone" />}
        {!connected ? "Connect wallet to send" : tx.phase === "signing" ? "Approve in wallet…" : tx.phase === "confirming" ? "Confirming…" : "Send SOL"}
      </Button>
      {tx.phase !== "idle" && <TransactionStatus error={tx.error} signature={tx.signature} state={tx.phase} title="Transfer" />}
    </form>
  );
}
