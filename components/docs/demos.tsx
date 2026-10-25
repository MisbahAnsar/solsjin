"use client";

import { type ComponentType, type ReactNode, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "motion/react";
import { ArrowRightIcon, CoinsIcon, GearSixIcon, ImagesIcon, ListBulletsIcon, PlusIcon, SparkleIcon } from "@phosphor-icons/react";
import { GooeyTabs } from "@/components/motion/gooey-tabs";
import { LiquidMetalButton } from "@/components/motion/liquid-metal-button";
import { GooFilter, gooStyle, liquid, useGooId } from "@/components/motion/goo";
import { LiquidGlass, ScrollEdge } from "@/components/ui/liquid-glass";
import { useCluster } from "@/components/providers/cluster";
import { useToast } from "@/components/providers/toast";
import {
  AddressDisplay,
  AirdropButton,
  ClusterBadge,
  ClusterSelector,
  ConnectedPill,
  ConnectWallet,
  EmptyWallets,
  NetworkStatus,
  NftCard,
  SendSolForm,
  SolBalance,
  SwapWidget,
  TokenAmountInput,
  TokenIcon,
  TokenSelector,
  TransactionStatus,
  TransactionToast,
  type TransactionState,
  useWalletModal,
  WalletAvatar,
  WalletConnectButton,
} from "@/components/solana";
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Dialog, FieldHint, Input, Label } from "@/components/ui";
import { explorerUrl, type SolanaCluster } from "@/lib/solana/clusters";
import { findToken, TOKENS } from "@/lib/solana/tokens";

export const SAMPLE_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheT9h2mVJynYjQeT8y";
export const SAMPLE_SIGNATURE = "5UfDuX7WXYxsL8bNbf3yXpGJHpgZtB2s2pdkYKxvYbW9Ff8YdoQPCbYYwAkkGZFFd4BxkwhhF6zMnCf8vfkX1QJr";

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>;
}

function Stack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`flex w-full max-w-[400px] flex-col gap-3 ${className ?? ""}`}>{children}</div>;
}

// ------------------------------------------------------------------ Wallet

function ConnectWalletMenuDemo() {
  const { toast } = useToast();
  return (
    <div className="flex min-h-[170px] items-start justify-center pt-4">
      <ConnectedPill
        address={SAMPLE_ADDRESS}
        name="Phantom"
        onChange={() => toast({ status: "info", title: "Change wallet", description: "Opens the wallet modal in your app." })}
        onDisconnect={() => toast({ status: "success", title: "Disconnected (demo)" })}
      />
    </div>
  );
}

function WalletModalDemo() {
  const { setVisible } = useWalletModal();
  const { wallets } = useWallet();
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setVisible(true)}>Choose wallet</Button>
      <p className="text-xs text-muted">{wallets.length ? `${wallets.length} wallet${wallets.length > 1 ? "s" : ""} detected in this browser` : "No wallet detected. The modal shows install options."}</p>
    </div>
  );
}

function WalletEmptyDemo() {
  return (
    <div className="w-full max-w-[400px] rounded-[24px] border border-line bg-card py-4 shadow-pop">
      <p className="px-5 pb-2 text-[15px] font-semibold tracking-[-.02em]">Connect a wallet</p>
      <EmptyWallets />
    </div>
  );
}

function WalletButtonDemo() {
  const [state, setState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  useEffect(() => {
    if (state !== "connecting") return;
    const timer = setTimeout(() => setState("connected"), 1200);
    return () => clearTimeout(timer);
  }, [state]);
  if (state === "connected") return <WalletConnectButton onDisconnect={() => setState("disconnected")} state="connected" wallet={{ name: "Phantom", address: SAMPLE_ADDRESS }} />;
  if (state === "connecting") return <WalletConnectButton state="connecting" />;
  return <WalletConnectButton onConnect={() => setState("connecting")} state="disconnected" />;
}

// ------------------------------------------------------------------ Network

function ClusterSelectorDemo() {
  const { info } = useCluster();
  return (
    <div className="flex flex-col items-center gap-4">
      <ClusterSelector />
      <div className="flex items-center gap-2 text-xs text-muted">
        <ClusterBadge /> <span className="font-mono text-[11px]">{info.endpoint.replace("https://", "")}</span>
      </div>
    </div>
  );
}

function ClusterControlledDemo() {
  const [value, setValue] = useState<SolanaCluster>("mainnet-beta");
  return (
    <div className="flex flex-col items-center gap-3">
      <ClusterSelector onValueChange={setValue} size="sm" value={value} />
      <ClusterBadge cluster={value} />
    </div>
  );
}

// ------------------------------------------------------------------ Assets

function SolBalanceLiveDemo() {
  const { publicKey } = useWallet();
  return (
    <Stack>
      <SolBalance address={publicKey} />
      {!publicKey && <ConnectWallet className="self-center" size="sm" variant="outline" />}
    </Stack>
  );
}

function AmountDemo() {
  const [amount, setAmount] = useState("");
  return (
    <Stack>
      <TokenAmountInput balance={12.5} onChange={setAmount} symbol="SOL" usdPrice={180} value={amount} />
    </Stack>
  );
}

function AmountStatesDemo() {
  const [a, setA] = useState("99");
  const [c, setC] = useState("1.5");
  return (
    <Stack>
      <TokenAmountInput balance={20} label="Insufficient balance" onChange={setA} symbol="USDC" value={a} />
      <TokenAmountInput label="Loading balance" loading onChange={() => undefined} symbol="BONK" value="" />
      <TokenAmountInput disabled label="Disabled" onChange={setC} symbol="JUP" value={c} />
    </Stack>
  );
}

function TokenSelectorDemo() {
  const [token, setToken] = useState(findToken("SOL")!);
  return (
    <div className="flex flex-col items-center gap-3">
      <TokenSelector balances={{ [TOKENS[0].mint]: 12.5, [TOKENS[1].mint]: 420 }} onValueChange={setToken} value={token} />
      <p className="font-mono text-[11px] text-muted">{token.mint}</p>
    </div>
  );
}

function TokenIconDemo() {
  return (
    <Row>
      {TOKENS.map((token) => (
        <div className="flex flex-col items-center gap-1.5" key={token.mint}>
          <TokenIcon size={36} token={token} />
          <span className="text-[10px] font-semibold text-muted">{token.symbol}</span>
        </div>
      ))}
    </Row>
  );
}

function NftDemo() {
  const { toast } = useToast();
  return (
    <div className="grid w-full max-w-[640px] grid-cols-1 justify-items-center gap-4 sm:grid-cols-2">
      <NftCard
        attributes={[{ trait: "Body", value: "Liquid" }, { trait: "Eyes", value: "Laser" }]}
        collection="Solsjin Genesis"
        mint="GooA1vXQ7mh8jzdQq9RdfHPB2bJ7vJ2Ndr6yrStkq421"
        name="Goo #0421"
        onBuy={() => toast({ status: "info", title: "Buy Goo #0421", description: "Wire onBuy to your marketplace." })}
        price={4.2}
        verified
      />
      <NftCard collection="Drip Club" mint="DripZ9mFh2bJ7vJ2NdQq9RdfHPB2bXQ7mh8jzdr6yrS" name="Drip #77" price={0.85} />
    </div>
  );
}

// ------------------------------------------------------------------ Transactions

function SendDemo() {
  return (
    <Stack>
      <div className="flex items-center justify-between">
        <ClusterBadge />
        <AirdropButton size="sm" variant="ghost" />
      </div>
      <SendSolForm />
    </Stack>
  );
}

function AirdropDemo() {
  const { cluster, setCluster } = useCluster();
  const { connected } = useWallet();
  return (
    <div className="flex flex-col items-center gap-3">
      <AirdropButton />
      {cluster === "mainnet-beta" ? (
        <button className="text-xs font-semibold text-muted underline-offset-4 hover:text-fg hover:underline" onClick={() => setCluster("devnet")} type="button">
          Airdrops need devnet. Switch now
        </button>
      ) : !connected ? (
        <ConnectWallet size="sm" variant="outline" />
      ) : (
        <ClusterBadge />
      )}
    </div>
  );
}

const LIFECYCLE: TransactionState[] = ["signing", "confirming", "confirmed"];

function TxLifecycleDemo() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setIndex((i) => (i + 1) % (LIFECYCLE.length + 1)), index === LIFECYCLE.length - 1 ? 2600 : 1500);
    return () => clearTimeout(timer);
  }, [index]);
  const state = LIFECYCLE[Math.min(index, LIFECYCLE.length - 1)];
  return (
    <Stack>
      <TransactionStatus signature={state === "signing" ? null : SAMPLE_SIGNATURE} state={state} title="Send 1.25 SOL" />
    </Stack>
  );
}

function TxStatesDemo() {
  return (
    <div className="grid w-full max-w-[760px] gap-3 sm:grid-cols-2">
      <TransactionStatus state="signing" />
      <TransactionStatus signature={SAMPLE_SIGNATURE} state="confirming" />
      <TransactionStatus signature={SAMPLE_SIGNATURE} state="confirmed" />
      <TransactionStatus error="Blockhash expired. Try again." state="failed" />
    </div>
  );
}

function ToastDemo() {
  const { toast, update } = useToast();
  const { cluster } = useCluster();
  function fire(outcome: "success" | "error") {
    const id = toast({ status: "loading", title: "Sending 1.25 SOL", description: "Waiting for confirmation…" });
    setTimeout(() => {
      if (outcome === "success") update(id, { status: "success", title: "Sent 1.25 SOL", description: "Confirmed in 1.2s", action: { label: "View on Explorer", href: explorerUrl("tx", SAMPLE_SIGNATURE, cluster) } });
      else update(id, { status: "error", title: "Transaction failed", description: "Insufficient funds for fee" });
    }, 1600);
  }
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <TransactionToast signature={SAMPLE_SIGNATURE} status="success" title="Swap confirmed" />
        <TransactionToast status="loading" title="Confirming mint…" />
      </div>
      <Row>
        <Button onClick={() => fire("success")} size="sm">
          Simulate success
        </Button>
        <Button onClick={() => fire("error")} size="sm" variant="outline">
          Simulate failure
        </Button>
      </Row>
    </div>
  );
}

function ToastTrackDemo() {
  const { toast } = useToast();
  return (
    <Row>
      <Button onClick={() => toast({ status: "info", title: "Heads up", description: "Info toasts work too." })} size="sm" variant="secondary">
        Info toast
      </Button>
      <Button onClick={() => toast({ status: "success", title: "Saved", duration: 2000 })} size="sm" variant="ghost">
        Short success
      </Button>
    </Row>
  );
}

// ------------------------------------------------------------------ Motion

function GooeyTabsDemo() {
  const [tab, setTab] = useState<"tokens" | "nfts" | "activity">("tokens");
  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-4">
      <GooeyTabs
        ariaLabel="Portfolio"
        idPrefix="demo-portfolio"
        onValueChange={setTab}
        options={[
          { value: "tokens", label: "Tokens", icon: <CoinsIcon size={15} weight="bold" /> },
          { value: "nfts", label: "NFTs", icon: <ImagesIcon size={15} weight="bold" /> },
          { value: "activity", label: "Activity", icon: <ListBulletsIcon size={15} weight="bold" /> },
        ]}
        value={tab}
      />
      <div aria-labelledby={`demo-portfolio-tab-${tab}`} className="w-full rounded-2xl border border-dashed border-line p-4 text-center text-xs text-muted" id={`demo-portfolio-panel-${tab}`} role="tabpanel">
        {tab === "tokens" ? "12 tokens · $4,218.20" : tab === "nfts" ? "34 collectibles across 6 collections" : "Last activity 2 minutes ago"}
      </div>
    </div>
  );
}

const FEED_COLORS = ["#14f195", "#9945ff", "#ff8a3d", "#2f80ff", "#ff4f8b", "#f5c400"];

function LiquidGlassDemo() {
  return (
    <div className="relative h-72 w-full max-w-[420px] overflow-y-auto rounded-3xl border border-line bg-bg [scrollbar-width:none]">
      <div className="sticky top-0 z-10 h-0">
        <ScrollEdge height={64} />
        <LiquidGlass className="absolute inset-x-3 top-3 flex h-12 items-center justify-between px-4 text-sm font-semibold text-fg" radius={9999} refraction>
          <span>Activity</span>
          <span className="text-xs font-medium text-muted">Scroll me</span>
        </LiquidGlass>
      </div>
      <ul className="flex flex-col gap-2.5 px-3 pb-3 pt-[72px]">
        {Array.from({ length: 14 }, (_, index) => (
          <li className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3" key={index}>
            <span className="size-9 shrink-0 rounded-full" style={{ background: FEED_COLORS[index % FEED_COLORS.length] }} />
            <span className="flex flex-1 flex-col">
              <span className="text-[13px] font-semibold text-fg">{index % 3 === 0 ? "Received SOL" : index % 3 === 1 ? "Swapped USDC → SOL" : "Minted NFT"}</span>
              <span className="text-[11px] text-muted">{index + 1} min ago</span>
            </span>
            <span className="font-mono text-xs font-semibold text-fg">{(index * 1.37 + 0.42).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiquidGlassMaterialsDemo() {
  return (
    <div
      className="relative grid w-full max-w-[460px] place-items-center rounded-3xl p-8"
      style={{ background: "repeating-linear-gradient(115deg, #14f195 0 18px, #9945ff 18px 36px, #ffffff 36px 54px, #0a0a0a 54px 72px)" }}
    >
      <div className="flex flex-wrap justify-center gap-3">
        {(["clear", "regular", "thick"] as const).map((material) => (
          <LiquidGlass className="px-5 py-3 text-sm font-semibold capitalize text-fg" key={material} material={material} radius={18} refraction>
            {material}
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
}

function ScrollEdgeDemo() {
  return (
    <div className="relative h-64 w-full max-w-[420px] overflow-y-auto rounded-3xl border border-line bg-bg [scrollbar-width:none]">
      <div className="sticky top-0 z-10 h-0">
        <ScrollEdge height={80} />
        <LiquidGlass className="absolute inset-x-6 top-3 flex h-11 items-center justify-center text-xs font-semibold text-fg" material="regular" radius={9999} refraction>
          solsjin
        </LiquidGlass>
      </div>
      <div className="space-y-3 px-5 pb-5 pt-20 text-sm leading-6 text-muted">
        {Array.from({ length: 6 }, (_, index) => (
          <p key={index}>
            <span className="font-semibold text-fg">Block {index + 1}.</span> Content keeps flowing under the bar. The edge blurs it progressively, so
            nothing is ever cut by a hard line, and the glass bar on top stays readable.
          </p>
        ))}
      </div>
    </div>
  );
}

function GooFilterDemo() {
  const id = useGooId("demo-blob");
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <GooFilter blur={8} id={id} />
      <div className="relative grid h-[150px] w-[260px] place-items-center">
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center" style={gooStyle(id)}>
          {[-1, 0, 1].map((i) => (
            <motion.span
              animate={open ? { x: i * 78, y: i === 0 ? -46 : 18, scale: 0.8 } : { x: 0, y: 0, scale: 0.6 }}
              className="absolute size-14 rounded-full bg-fg"
              key={i}
              transition={{ ...(open ? liquid.body : liquid.snap), delay: open ? (i + 1) * 0.05 : (1 - i) * 0.03 }}
            />
          ))}
          <span className="absolute size-16 rounded-full bg-fg" />
        </div>
        <button
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          className="relative z-10 grid size-16 place-items-center rounded-full text-bg"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <motion.span animate={{ rotate: open ? 45 : 0 }} className="grid place-items-center">
            <PlusIcon size={22} weight="bold" />
          </motion.span>
        </button>
      </div>
      <p className="text-xs text-muted">Click the blob</p>
    </div>
  );
}

function LiquidMetalDemo() {
  return (
    <Row>
      <LiquidMetalButton href="/components">
        Get started <ArrowRightIcon size={16} weight="bold" />
      </LiquidMetalButton>
      <LiquidMetalButton aria-label="Generate" shape="circle">
        <SparkleIcon size={18} weight="fill" />
      </LiquidMetalButton>
    </Row>
  );
}

function LiquidMetalSizesDemo() {
  return (
    <Row>
      <LiquidMetalButton size="sm">Small</LiquidMetalButton>
      <LiquidMetalButton size="md">Medium</LiquidMetalButton>
      <LiquidMetalButton size="lg">Large</LiquidMetalButton>
    </Row>
  );
}

function LiquidMetalSpeedDemo() {
  return (
    <Row>
      <LiquidMetalButton speed={14}>Calm</LiquidMetalButton>
      <LiquidMetalButton speed={3}>Lively</LiquidMetalButton>
    </Row>
  );
}

// ------------------------------------------------------------------ Primitives

function ButtonsDemo() {
  return (
    <Row>
      <Button>Primary</Button>
      <Button variant="accent">
        <SparkleIcon size={15} weight="fill" /> Accent
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </Row>
  );
}

function ButtonSizesDemo() {
  return (
    <Row>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button loading>Saving</Button>
      <Button aria-label="Settings" size="icon" variant="outline">
        <GearSixIcon size={17} weight="bold" />
      </Button>
    </Row>
  );
}

function BadgesDemo() {
  return (
    <Row>
      <Badge>Neutral</Badge>
      <Badge tone="success">Confirmed</Badge>
      <Badge tone="warning">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="solana">Solana</Badge>
      <Badge tone="violet">Devnet</Badge>
      <Badge tone="outline">Outline</Badge>
    </Row>
  );
}

function InputDemo() {
  return (
    <Stack>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-memo">Memo</Label>
        <Input aria-describedby="demo-memo-hint" id="demo-memo" placeholder="Optional note" />
        <FieldHint id="demo-memo-hint">Stored on-chain, visible to everyone.</FieldHint>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="demo-bad">Recipient</Label>
        <Input aria-describedby="demo-bad-hint" className="font-mono text-[13px]" defaultValue="not-an-address" id="demo-bad" invalid />
        <FieldHint id="demo-bad-hint" tone="danger">
          Not a valid Solana address
        </FieldHint>
      </div>
    </Stack>
  );
}

function CardDemo() {
  return (
    <Card className="w-full max-w-[360px]">
      <CardHeader>
        <CardTitle>Liquid staking</CardTitle>
        <CardDescription>Stake SOL, keep it liquid, earn ~7% APY.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-xl bg-bg-subtle px-3 py-2.5 text-sm">
          <span className="text-muted">You receive</span>
          <span className="font-semibold tabular-nums">0.9871 jitoSOL</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Stake</Button>
      </CardFooter>
    </Card>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open dialog
      </Button>
      <Dialog description="Review the details before you sign." onOpenChange={setOpen} open={open} title="Confirm swap">
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between rounded-xl bg-bg-subtle px-3 py-2.5 text-sm">
            <span className="text-muted">1 SOL</span>
            <span className="font-semibold">≈ 180.42 USDC</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button className="flex-1" data-autofocus onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export const DEMOS: Record<string, ComponentType> = {
  "connect-wallet:default": () => <ConnectWallet />,
  "connect-wallet:variants": () => (
    <Row>
      <ConnectWallet label="Launch app" size="lg" variant="accent" />
      <ConnectWallet size="sm" variant="outline" />
    </Row>
  ),
  "connect-wallet:menu": ConnectWalletMenuDemo,
  "wallet-modal:default": WalletModalDemo,
  "wallet-modal:empty": WalletEmptyDemo,
  "wallet-connect-button:default": WalletButtonDemo,
  "address-display:default": () => <AddressDisplay address={SAMPLE_ADDRESS} />,
  "address-display:variants": () => (
    <Stack className="items-center">
      <AddressDisplay address={SAMPLE_ADDRESS} avatar explorer variant="pill" />
      <AddressDisplay address={SAMPLE_ADDRESS} chars={8} />
      <AddressDisplay address={SAMPLE_ADDRESS} className="max-w-[300px]" full />
    </Stack>
  ),
  "wallet-avatar:default": () => (
    <Row>
      {[24, 40, 56].map((size, i) => (
        <WalletAvatar address={i === 0 ? SAMPLE_ADDRESS : `${SAMPLE_ADDRESS}${i}`} key={size} size={size} />
      ))}
    </Row>
  ),
  "cluster-selector:default": ClusterSelectorDemo,
  "cluster-selector:controlled": ClusterControlledDemo,
  "cluster-badge:default": () => (
    <Row>
      <ClusterBadge cluster="mainnet-beta" />
      <ClusterBadge cluster="devnet" />
      <ClusterBadge cluster="testnet" />
    </Row>
  ),
  "network-status:default": () => <NetworkStatus />,
  "sol-balance:default": SolBalanceLiveDemo,
  "sol-balance:address": () => (
    <Stack>
      <SolBalance address="vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg" label="Sample wallet" />
    </Stack>
  ),
  "sol-balance:static": () => (
    <Stack>
      <SolBalance amount={128.42} change="+2.4%" />
    </Stack>
  ),
  "token-amount-input:default": AmountDemo,
  "token-amount-input:states": AmountStatesDemo,
  "token-selector:default": TokenSelectorDemo,
  "token-icon:default": TokenIconDemo,
  "nft-card:default": NftDemo,
  "send-sol-form:default": SendDemo,
  "swap-widget:default": () => <SwapWidget />,
  "airdrop-button:default": AirdropDemo,
  "transaction-status:default": TxLifecycleDemo,
  "transaction-status:states": TxStatesDemo,
  "transaction-toast:default": ToastDemo,
  "transaction-toast:track": ToastTrackDemo,
  "gooey-tabs:default": GooeyTabsDemo,
  "gooey-tabs:goo": GooFilterDemo,
  "liquid-glass:default": LiquidGlassDemo,
  "liquid-glass:materials": LiquidGlassMaterialsDemo,
  "liquid-glass:header": ScrollEdgeDemo,
  "liquid-metal-button:default": LiquidMetalDemo,
  "liquid-metal-button:sizes": LiquidMetalSizesDemo,
  "liquid-metal-button:speed": LiquidMetalSpeedDemo,
  "button:default": ButtonsDemo,
  "button:sizes": ButtonSizesDemo,
  "badge:default": BadgesDemo,
  "input:default": InputDemo,
  "card:default": CardDemo,
  "dialog:default": DialogDemo,
};

export function Demo({ id }: { id: string }) {
  const Component = DEMOS[id];
  if (!Component) return <p className="text-sm text-muted">Preview coming soon.</p>;
  return <Component />;
}
