"use client";

import { useId, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircleIcon, SignatureIcon, WarningCircleIcon } from "@phosphor-icons/react";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import { Label } from "../ui/input";
import { describeError } from "./hooks";
import { useWalletModal } from "./wallet-modal";

/** Verify an ed25519 signature over a UTF-8 message for a base58 public key. */
export function verifySignedMessage(message: string, signature: Uint8Array, publicKey: Uint8Array) {
  try {
    return nacl.sign.detached.verify(new TextEncoder().encode(message), signature, publicKey);
  } catch {
    return false;
  }
}

type Result = { signature: string; verified: boolean; message: string; signer: string } | null;

/** Off-chain message signing (sign-in, proofs) with local ed25519 verification. No transaction, no fee. */
export function SignMessage({
  defaultMessage,
  onSigned,
  className,
}: {
  defaultMessage?: string;
  onSigned?: (result: { message: string; signature: Uint8Array; publicKey: string; verified: boolean }) => void;
  className?: string;
}) {
  const id = useId();
  const { publicKey, signMessage, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [message, setMessage] = useState(defaultMessage ?? "Sign in to solsjin\n\nThis request will not trigger a transaction or cost any fees.");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);
  const unsupported = connected && !signMessage;

  async function sign() {
    if (!connected || !publicKey) return setVisible(true);
    if (!signMessage || !message.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const signature = await signMessage(new TextEncoder().encode(message));
      const verified = verifySignedMessage(message, signature, publicKey.toBytes());
      setResult({ signature: bs58.encode(signature), verified, message, signer: publicKey.toBase58() });
      onSigned?.({ message, signature, publicKey: publicKey.toBase58(), verified });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-msg`}>Message</Label>
        <textarea
          className="min-h-[96px] w-full resize-y rounded-2xl border border-line bg-card px-3.5 py-3 text-[13px] leading-5 text-fg outline-none transition placeholder:text-faint focus-visible:border-fg/30 focus-visible:ring-4 focus-visible:ring-ring/20"
          id={`${id}-msg`}
          maxLength={1000}
          onChange={(event) => {
            setMessage(event.target.value);
            setResult(null);
          }}
          value={message}
        />
      </div>
      <Button className="w-full" disabled={connected && (unsupported || !message.trim())} loading={busy} onClick={sign} size="lg">
        {!busy && <SignatureIcon size={17} weight="duotone" />}
        {!connected ? "Connect wallet to sign" : unsupported ? `${wallet?.adapter.name ?? "This wallet"} can't sign messages` : busy ? "Approve in wallet…" : "Sign message"}
      </Button>
      <div aria-live="polite" role="status">
        {error && (
          <p className="flex items-center gap-1.5 text-[12px] text-danger">
            <WarningCircleIcon size={14} weight="bold" /> {error}
          </p>
        )}
        {result && (
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg-muted/60 p-3">
            <p className={cn("flex items-center gap-1.5 text-[12px] font-semibold", result.verified ? "text-accent" : "text-danger")}>
              {result.verified ? <CheckCircleIcon size={15} weight="fill" /> : <WarningCircleIcon size={15} weight="fill" />}
              {result.verified ? "Signature verified (ed25519)" : "Signature did not verify"}
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{result.signature}</code>
              <CopyButton label="Copy signature" value={result.signature} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
