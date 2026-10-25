"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { DropIcon } from "@phosphor-icons/react";
import { useOptionalCluster } from "@/components/providers/cluster";
import { useOptionalToast } from "@/components/providers/toast";
import { CLUSTERS, explorerUrl } from "@/lib/solana/clusters";
import { LAMPORTS_PER_SOL, shortenAddress } from "@/lib/solana/format";
import { Button, type ButtonProps } from "../ui/button";
import { describeError, toPublicKey } from "./hooks";

export type AirdropButtonProps = {
  /** SOL to request (devnet faucet caps at 1-2 SOL per request). */
  amount?: number;
  /** Recipient. Defaults to the connected wallet. */
  address?: string;
  onSuccess?: (signature: string) => void;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

/** Requests a devnet/testnet airdrop and confirms it. Disabled on mainnet; explains rate limits. */
export function AirdropButton({ amount = 1, address, onSuccess, className, size, variant = "outline" }: AirdropButtonProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const cluster = useOptionalCluster()?.cluster ?? "devnet";
  const toastApi = useOptionalToast();
  const [busy, setBusy] = useState(false);
  const recipient = toPublicKey(address) ?? publicKey;
  const supported = CLUSTERS[cluster].faucet;

  async function request() {
    if (!recipient || busy) return;
    setBusy(true);
    const id = toastApi?.toast({ status: "loading", title: `Requesting ${amount} SOL`, description: `Airdrop to ${shortenAddress(recipient.toBase58())}` });
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      const signature = await connection.requestAirdrop(recipient, Math.round(amount * LAMPORTS_PER_SOL));
      const result = await connection.confirmTransaction({ signature, ...latest }, "confirmed");
      if (result.value.err) throw new Error(`Airdrop failed: ${JSON.stringify(result.value.err)}`);
      if (id) toastApi?.update(id, { status: "success", title: `Airdropped ${amount} SOL`, description: shortenAddress(signature, 6), action: { label: "View on Explorer", href: explorerUrl("tx", signature, cluster) } });
      onSuccess?.(signature);
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      // Public faucets answer rate limits with 429, "limit reached", "run dry" or a bare "Internal error".
      const limited = /429|too many requests|limit|run dry|internal error/i.test(raw);
      if (id)
        toastApi?.update(id, {
          status: "error",
          title: limited ? "Faucet rate limited" : "Airdrop failed",
          description: limited ? "The public faucet is rate limited. Wait a bit, try a smaller amount or use the web faucet." : describeError(error),
          action: { label: "Open faucet.solana.com", href: "https://faucet.solana.com" },
        });
    } finally {
      setBusy(false);
    }
  }

  const reason = !supported ? "Airdrops are only available on devnet, testnet and localnet" : !recipient ? "Connect a wallet to request an airdrop" : undefined;

  return (
    <Button
      aria-describedby={undefined}
      className={className}
      disabled={!!reason}
      loading={busy}
      onClick={request}
      size={size}
      title={reason}
      variant={variant}
    >
      {!busy && <DropIcon className="text-violet" size={16} weight="duotone" />}
      {busy ? "Requesting…" : `Airdrop ${amount} SOL`}
    </Button>
  );
}
