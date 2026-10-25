"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, type Transaction, type TransactionSignature, type VersionedTransaction } from "@solana/web3.js";
import { useOptionalCluster } from "@/components/providers/cluster";
import { useOptionalToast } from "@/components/providers/toast";
import { explorerUrl, type SolanaCluster } from "@/lib/solana/clusters";
import { JUPITER_API_URL, jupiterHeaders } from "@/lib/solana/config";
import { lamportsToSol, shortenAddress } from "@/lib/solana/format";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export function toPublicKey(value: string | PublicKey | null | undefined) {
  if (!value) return null;
  if (value instanceof PublicKey) return value;
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

export function describeError(error: unknown): string {
  if (!error) return "Something went wrong";
  const message = error instanceof Error ? error.message : String(error);
  if (/user rejected|rejected the request|declined/i.test(message)) return "Request rejected in wallet";
  if (/insufficient (funds|lamports)|0x1\b/i.test(message)) return "Insufficient funds for this transaction";
  if (/blockhash not found|block height exceeded/i.test(message)) return "Transaction expired, please retry";
  if (/429|too many requests|rate limit/i.test(message)) return "Rate limited, try again in a moment";
  if (/does not support versioned|version.*not supported/i.test(message)) return "This wallet cannot sign versioned transactions";
  if (/wallet not connected|WalletNotConnected/i.test(message)) return "Connect a wallet first";
  if (/\b403\b|access forbidden/i.test(message)) return "The RPC refused this request (403). Public endpoints block some methods; set your own RPC in .env.local";
  if (/failed to fetch|network|ECONN|timeout/i.test(message)) return "Network error reaching the RPC";
  return message.length > 140 ? `${message.slice(0, 140)}…` : message;
}

type BalanceState = { key: string; lamports: number | null; error: string | null; updatedAt: number | null };

/**
 * Live SOL balance for an address. Fetches on mount and cluster change, subscribes to
 * account changes over websocket, and exposes a manual `refresh`.
 */
export function useSolBalance(address?: string | PublicKey | null, options: { watch?: boolean } = {}) {
  const { connection } = useConnection();
  const { watch = true } = options;
  const key = useMemo(() => toPublicKey(address)?.toBase58() ?? "", [address]);
  const fetchKey = `${connection.rpcEndpoint}|${key}`;
  const [state, setState] = useState<BalanceState>({ key: "", lamports: null, error: null, updatedAt: null });
  const [nonce, setNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!key) return;
    let active = true;
    const pubkey = new PublicKey(key);
    connection
      .getBalance(pubkey, "confirmed")
      .then((lamports) => active && setState({ key: fetchKey, lamports, error: null, updatedAt: Date.now() }))
      .catch((error) => active && setState({ key: fetchKey, lamports: null, error: describeError(error), updatedAt: Date.now() }))
      .finally(() => active && setRefreshing(false));

    let subscription: number | null = null;
    if (watch) {
      try {
        subscription = connection.onAccountChange(
          pubkey,
          (info) => active && setState({ key: fetchKey, lamports: info.lamports, error: null, updatedAt: Date.now() }),
          { commitment: "confirmed" },
        );
      } catch {
        subscription = null;
      }
    }
    return () => {
      active = false;
      if (subscription !== null) connection.removeAccountChangeListener(subscription).catch(() => undefined);
    };
  }, [connection, key, fetchKey, watch, nonce]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setNonce((n) => n + 1);
  }, []);

  const current = state.key === fetchKey;
  const status: AsyncStatus = !key ? "idle" : !current ? "loading" : state.error ? "error" : "success";
  return {
    status,
    lamports: current ? state.lamports : null,
    sol: current && state.lamports !== null ? lamportsToSol(state.lamports) : null,
    error: current ? state.error : null,
    updatedAt: current ? state.updatedAt : null,
    refreshing: refreshing && current,
    refresh,
  };
}

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

export type TokenBalance = { mint: string; amount: bigint; decimals: number; uiAmount: number };

/** All SPL + Token-2022 balances for an owner, keyed by mint. */
export function useTokenBalances(owner?: string | PublicKey | null) {
  const { connection } = useConnection();
  const key = useMemo(() => toPublicKey(owner)?.toBase58() ?? "", [owner]);
  const fetchKey = `${connection.rpcEndpoint}|${key}`;
  const [state, setState] = useState<{ key: string; balances: Map<string, TokenBalance>; error: string | null }>({
    key: "",
    balances: new Map(),
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!key) return;
    let active = true;
    const pubkey = new PublicKey(key);
    Promise.all(
      [TOKEN_PROGRAM, TOKEN_2022_PROGRAM].map((programId) =>
        connection.getParsedTokenAccountsByOwner(pubkey, { programId }, "confirmed").catch(() => ({ value: [] })),
      ),
    )
      .then((results) => {
        if (!active) return;
        const balances = new Map<string, TokenBalance>();
        for (const result of results) {
          for (const { account } of result.value) {
            const parsed = account.data.parsed?.info;
            if (!parsed?.mint || !parsed.tokenAmount) continue;
            const prev = balances.get(parsed.mint);
            const amount = BigInt(parsed.tokenAmount.amount) + (prev?.amount ?? BigInt(0));
            const decimals = Number(parsed.tokenAmount.decimals);
            balances.set(parsed.mint, { mint: parsed.mint, amount, decimals, uiAmount: Number(amount) / 10 ** decimals });
          }
        }
        setState({ key: fetchKey, balances, error: null });
      })
      .catch((error) => active && setState({ key: fetchKey, balances: new Map(), error: describeError(error) }));
    return () => {
      active = false;
    };
  }, [connection, key, fetchKey, nonce]);

  const current = state.key === fetchKey;
  return {
    status: (!key ? "idle" : !current ? "loading" : state.error ? "error" : "success") as AsyncStatus,
    balances: current ? state.balances : new Map<string, TokenBalance>(),
    error: current ? state.error : null,
    refresh: useCallback(() => setNonce((n) => n + 1), []),
  };
}

/** USD prices from Jupiter's public price API, keyed by mint. Mainnet prices regardless of cluster. */
export function useTokenPrices(mints: string[]) {
  const ids = useMemo(() => Array.from(new Set(mints)).sort().join(","), [mints]);
  const [state, setState] = useState<{ ids: string; prices: Record<string, number> }>({ ids: "", prices: {} });
  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    fetch(`${JUPITER_API_URL}/price/v3?ids=${ids}`, { signal: controller.signal, headers: jupiterHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Record<string, { usdPrice?: number } | null>) => {
        const prices: Record<string, number> = {};
        for (const [mint, entry] of Object.entries(data)) if (entry?.usdPrice) prices[mint] = entry.usdPrice;
        setState({ ids, prices });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [ids]);
  return state.ids === ids ? state.prices : {};
}

export type TxPhase = "idle" | "signing" | "confirming" | "confirmed" | "failed";

export type TxState = { phase: TxPhase; signature: string | null; error: string | null; startedAt: number | null };

const idleTx: TxState = { phase: "idle", signature: null, error: null, startedAt: null };

/**
 * Sign, send and confirm a transaction with the connected wallet, while mirroring progress into
 * state (for <TransactionStatus/>) and a gooey toast with an explorer link (when a ToastProvider exists).
 */
export function useSendTransaction(options: { label?: string; toast?: boolean } = {}) {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const clusterContext = useOptionalCluster();
  const toastApi = useOptionalToast();
  const cluster: SolanaCluster = clusterContext?.cluster ?? "devnet";
  const [state, setState] = useState<TxState>(idleTx);
  const inflight = useRef(false);
  const { label = "Transaction", toast: showToast = true } = options;

  const send = useCallback(
    async (build: () => Promise<Transaction | VersionedTransaction> | Transaction | VersionedTransaction): Promise<TransactionSignature | null> => {
      if (inflight.current) return null;
      if (!publicKey) {
        setState({ phase: "failed", signature: null, error: "Connect a wallet first", startedAt: Date.now() });
        return null;
      }
      inflight.current = true;
      setState({ phase: "signing", signature: null, error: null, startedAt: Date.now() });
      const toastId =
        showToast && toastApi ? toastApi.toast({ status: "loading", title: `${label}: approve in wallet`, description: "Waiting for your signature…" }) : null;
      try {
        const latest = await connection.getLatestBlockhash("confirmed");
        const tx = await build();
        // Confirm against the blockhash the transaction actually carries.
        let blockhash = latest.blockhash;
        if ("version" in tx) {
          blockhash = tx.message.recentBlockhash;
        } else {
          const legacy = tx as Transaction;
          legacy.recentBlockhash ??= latest.blockhash;
          legacy.feePayer ??= publicKey;
          blockhash = legacy.recentBlockhash;
        }
        const signature = await sendTransaction(tx, connection, { maxRetries: 3 });
        setState((s) => ({ ...s, phase: "confirming", signature }));
        if (toastId && toastApi)
          toastApi.update(toastId, {
            title: `${label}: confirming`,
            description: shortenAddress(signature, 6),
            action: { label: "View on Explorer", href: explorerUrl("tx", signature, cluster) },
          });
        const result = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
          "confirmed",
        );
        if (result.value.err) throw new Error(`Transaction failed: ${JSON.stringify(result.value.err)}`);
        setState((s) => ({ ...s, phase: "confirmed" }));
        if (toastId && toastApi)
          toastApi.update(toastId, {
            status: "success",
            title: `${label} confirmed`,
            description: shortenAddress(signature, 6),
            action: { label: "View on Explorer", href: explorerUrl("tx", signature, cluster) },
          });
        return signature;
      } catch (error) {
        const message = describeError(error);
        setState((s) => ({ ...s, phase: "failed", error: message }));
        if (toastId && toastApi) toastApi.update(toastId, { status: "error", title: `${label} failed`, description: message });
        return null;
      } finally {
        inflight.current = false;
      }
    },
    [cluster, connection, label, publicKey, sendTransaction, showToast, toastApi],
  );

  const reset = useCallback(() => setState(idleTx), []);
  return { ...state, send, reset, busy: state.phase === "signing" || state.phase === "confirming" };
}

export type WalletAsset = {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  compressed?: boolean;
};

export type AssetSource = "das" | "token-accounts";

/**
 * NFTs owned by an address. Uses the Metaplex DAS `getAssetsByOwner` method when the RPC supports
 * it (Helius, Triton, QuickNode...). Public RPCs don't, so it falls back to token accounts with
 * amount 1 and 0 decimals: real mints, but without names or images. `source` tells you which.
 */
export function useWalletAssets(owner?: string | PublicKey | null, options: { limit?: number } = {}) {
  const { connection } = useConnection();
  const { limit = 24 } = options;
  const key = useMemo(() => toPublicKey(owner)?.toBase58() ?? "", [owner]);
  const fetchKey = `${connection.rpcEndpoint}|${key}|${limit}`;
  const [state, setState] = useState<{ key: string; assets: WalletAsset[]; source: AssetSource | null; error: string | null }>({
    key: "",
    assets: [],
    source: null,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!key) return;
    let active = true;
    const controller = new AbortController();

    async function viaDas(): Promise<WalletAsset[] | null> {
      // Some RPCs never answer unknown methods; give DAS 6s before falling back.
      const das = new AbortController();
      const abort = () => das.abort();
      controller.signal.addEventListener("abort", abort);
      const timer = setTimeout(abort, 6000);
      let data;
      try {
        const res = await fetch(connection.rpcEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: "solsjin", method: "getAssetsByOwner", params: { ownerAddress: key, page: 1, limit } }),
          signal: das.signal,
        });
        data = await res.json().catch(() => null);
      } finally {
        clearTimeout(timer);
        controller.signal.removeEventListener("abort", abort);
      }
      if (!data || data.error || !data.result?.items) return null;
      type DasItem = {
        id: string;
        interface?: string;
        content?: { metadata?: { name?: string }; links?: { image?: string }; files?: { uri?: string; cdn_uri?: string }[] };
        grouping?: { group_key: string; group_value: string; collection_metadata?: { name?: string } }[];
        compression?: { compressed?: boolean };
      };
      return (data.result.items as DasItem[])
        .filter((item) => !/fungible/i.test(item.interface ?? "") || /nft/i.test(item.interface ?? ""))
        .map((item) => {
          const group = item.grouping?.find((g) => g.group_key === "collection");
          return {
            id: item.id,
            name: item.content?.metadata?.name?.trim() || shortenAddress(item.id),
            image: item.content?.links?.image || item.content?.files?.[0]?.cdn_uri || item.content?.files?.[0]?.uri,
            collection: group?.collection_metadata?.name || (group ? shortenAddress(group.group_value) : undefined),
            compressed: !!item.compression?.compressed,
          };
        });
    }

    async function viaTokenAccounts(): Promise<WalletAsset[]> {
      const pubkey = new PublicKey(key);
      const results = await Promise.all(
        [TOKEN_PROGRAM, TOKEN_2022_PROGRAM].map((programId) => connection.getParsedTokenAccountsByOwner(pubkey, { programId }, "confirmed")),
      );
      const assets: WalletAsset[] = [];
      for (const result of results)
        for (const { account } of result.value) {
          const info = account.data.parsed?.info;
          if (info?.tokenAmount?.decimals === 0 && info.tokenAmount.amount === "1") assets.push({ id: info.mint, name: shortenAddress(info.mint) });
        }
      return assets.slice(0, limit);
    }

    (async () => {
      try {
        const das = await viaDas().catch(() => null);
        if (!active) return;
        if (das) return setState({ key: fetchKey, assets: das, source: "das", error: null });
        const fallback = await viaTokenAccounts();
        if (active) setState({ key: fetchKey, assets: fallback, source: "token-accounts", error: null });
      } catch (error) {
        if (active) setState({ key: fetchKey, assets: [], source: null, error: describeError(error) });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [connection, key, fetchKey, limit, nonce]);

  const current = state.key === fetchKey;
  return {
    status: (!key ? "idle" : !current ? "loading" : state.error ? "error" : "success") as AsyncStatus,
    assets: current ? state.assets : [],
    source: current ? state.source : null,
    error: current ? state.error : null,
    refresh: useCallback(() => setNonce((n) => n + 1), []),
  };
}
