"use client";

import { useState } from "react";
import Link from "next/link";
import { AddressDisplay, ClusterBadge, ClusterSelector, SolBalance, SolanaMark, TokenAmountInput, TransactionStatus, WalletConnectButton, type SolanaCluster } from "../solana";
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Separator } from "../ui";

const sampleAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheT9h2mVJynYjQeT8y";
const integrationSnippet = `import { WalletConnectButton } from "@/components/solana";

const walletButtonProps = wallet
  ? { state: "connected" as const, wallet, onDisconnect: disconnect }
  : { state: "disconnected" as const, onConnect: openWalletPicker };

<WalletConnectButton {...walletButtonProps} />`;

const navigation = [
  { href: "#wallet", label: "Wallet & network", index: "01" },
  { href: "#assets", label: "Assets & amounts", index: "02" },
  { href: "#transactions", label: "Transactions", index: "03" },
  { href: "#primitives", label: "UI primitives", index: "04" },
  { href: "#integration", label: "Integration", index: "05" },
];

export function SolanaShowcase() {
  const [cluster, setCluster] = useState<SolanaCluster>("devnet");
  const [walletConnected, setWalletConnected] = useState(false);
  const [amount, setAmount] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(integrationSnippet);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      setCopiedCode(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-[#e9e7da]/80 bg-[#fffff3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Link className="text-sm font-bold tracking-[-.06em] text-[#171713] no-underline" href="/">SOLSJIN</Link>
            <span aria-hidden="true" className="h-4 w-px bg-[#deddcf]" />
            <span className="text-xs text-[#76756c]">Component library</span>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
            <Link className="hidden rounded-xl px-3 py-2 text-xs font-medium text-[#55554e] no-underline transition-colors hover:bg-[#f0efe5] hover:text-[#171713] sm:inline-flex" href="/">Home</Link>
            <a className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#11110f] px-3.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-[#292925]" href="https://github.com/MisbahAnsar/solsjin" target="_blank" rel="noreferrer">
              <GithubIcon /> GitHub <ArrowUpRightIcon />
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 pb-20 pt-7 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 lg:px-10 lg:pt-12">
        <aside className="lg:sticky lg:top-[100px] lg:h-[calc(100svh-120px)]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e9e7da] bg-white/75 p-3.5">
            <SolanaGlyph />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#22221e]">Solsjin UI</p>
              <p className="mt-0.5 text-[10px] text-[#85847c]">Solana components</p>
            </div>
            <Badge className="ml-auto" tone="success">Alpha</Badge>
          </div>
          <nav aria-label="Components sections" className="mt-5 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {navigation.map((item) => (
              <a className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-medium text-[#6d6c63] no-underline transition-colors hover:bg-white hover:text-[#171713] lg:w-full" href={item.href} key={item.href}>
                <span className="font-mono text-[9px] text-[#aaa99e]">{item.index}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-2xl border border-[#e9e7da] bg-[#f5f4ea] p-4 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#7b7a70]">Built for builders</p>
            <p className="mt-2 text-xs leading-5 text-[#65645c]">Typed, composable UI. Your wallet provider keeps control of keys and signatures.</p>
            <a className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#087c6b] no-underline hover:underline" href="#integration">Read the integration note <ArrowRightIcon /></a>
          </div>
        </aside>

        <main className="min-w-0">
          <section className="relative overflow-hidden rounded-[28px] border border-[#e7e4d5] bg-white p-6 shadow-[0_20px_60px_#1b190b0a] sm:p-9 lg:p-11">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-[360px] rounded-full bg-[radial-gradient(circle,#c7f5e6_0%,#eaf8f4_35%,transparent_70%)] opacity-90" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-10 size-48 rounded-full border border-[#d8efe7]" />
            <div className="relative max-w-[740px]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="solana"><span className="size-1.5 rounded-full bg-current" />Built for Solana</Badge>
                <span className="font-mono text-[10px] text-[#99988f]">/ components</span>
              </div>
              <h1 className="mt-5 text-[clamp(36px,6vw,64px)] font-semibold leading-[.98] tracking-[-.075em] text-[#171713]">Interfaces with<br className="hidden sm:block" /> on-chain clarity.</h1>
              <p className="mt-5 max-w-[550px] text-sm leading-6 text-[#6d6c63] sm:text-[15px] sm:leading-7">A thoughtful set of wallet, asset, network, and transaction components for Solana apps. Styled to feel native to your product, designed to keep the user in control.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#11110f] px-4 text-xs font-semibold text-white no-underline transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#292925]" href="#wallet">Explore components <ArrowDownIcon /></a>
                <span className="text-[11px] text-[#85847c]">Tailwind CSS · Wallet-provider agnostic</span>
              </div>
            </div>
          </section>

          <div className="mt-11 space-y-14 sm:mt-14 sm:space-y-16">
            <section className="scroll-mt-28" id="wallet">
              <SectionHeading index="01" title="Wallet & network" description="Clear connection states and unmistakable cluster context." />
              <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
                <Card>
                  <CardHeader className="flex-row items-start justify-between gap-3">
                    <div><CardTitle>Wallet connection</CardTitle><CardDescription className="mt-1">A compact control for connect, pending, and connected states.</CardDescription></div>
                    <span className="rounded-lg bg-[#f3f2e9] px-2 py-1 font-mono text-[9px] text-[#77766e]">INTERACTIVE</span>
                  </CardHeader>
                  <CardContent>
                    <div className="flex min-h-[126px] flex-col items-start justify-center gap-4 rounded-2xl border border-dashed border-[#e4e2d7] bg-[#fbfaf5] p-4 sm:p-5">
                      {walletConnected ? (
                        <WalletConnectButton state="connected" wallet={{ name: "Phantom", address: sampleAddress }} onDisconnect={() => setWalletConnected(false)} />
                      ) : (
                        <WalletConnectButton state="disconnected" onConnect={() => setWalletConnected(true)} />
                      )}
                      <p className="text-[10px] leading-4 text-[#85847c]">Preview state only. Connect <code className="rounded bg-[#f0efe5] px-1 py-0.5">onConnect</code> and <code className="rounded bg-[#f0efe5] px-1 py-0.5">onDisconnect</code> to your wallet hooks.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Network badge</CardTitle>
                    <CardDescription>Color and label identify the active cluster.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClusterSelector ariaLabel="Choose preview cluster" onValueChange={setCluster} options={[{ value: "mainnet-beta", label: "Mainnet" }, { value: "devnet", label: "Devnet" }, { value: "testnet", label: "Testnet" }]} value={cluster} />
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#eeede5] p-4">
                      <div><p className="text-xs font-semibold text-[#292923]">Connected to</p><p className="mt-1 text-[10px] text-[#85847c]">Cluster preview</p></div>
                      <ClusterBadge cluster={cluster} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="scroll-mt-28" id="assets">
              <SectionHeading index="02" title="Assets & amounts" description="Present native SOL and token inputs with legible precision." />
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="space-y-4">
                  <SolBalance amount="12.4832" />
                  <Card>
                    <CardHeader className="flex-row items-center justify-between pb-3">
                      <div><CardTitle>Wallet address</CardTitle><CardDescription className="mt-1">Full key stays available on hover and to assistive tech.</CardDescription></div>
                      <Badge tone="neutral">Public</Badge>
                    </CardHeader>
                    <CardContent><div className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-[#f7f6ef] px-3"><AddressDisplay address={sampleAddress} chars={6} /><span className="hidden text-[10px] text-[#99988f] sm:inline">Solana address</span></div></CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Token amount input</CardTitle>
                    <CardDescription>Controlled decimal input with a clear asset and balance context.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TokenAmountInput balance="12.4832" id="showcase-amount" onChange={(value) => { setAmount(value); setTransferMessage(""); }} value={amount} />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-[#85847c]">Available to send</span>
                      <Button onClick={() => { setAmount("12.4832"); setTransferMessage(""); }} size="sm" variant="ghost">Use max</Button>
                    </div>
                    <Button className="mt-3 w-full" disabled={!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0} onClick={() => setTransferMessage("Preview only — no transaction was sent.")}>Review transfer <ArrowRightIcon /></Button>
                    {transferMessage && <p aria-live="polite" className="mt-3 text-center text-[10px] text-[#087c6b]">{transferMessage}</p>}
                    <p className="mt-3 text-center text-[10px] text-[#99988f]">UI preview only — this button does not submit a transaction.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="scroll-mt-28" id="transactions">
              <SectionHeading index="03" title="Transaction states" description="Keep users informed from submission through confirmation or failure." />
              <Card className="mt-5">
                <CardHeader className="pb-3">
                  <CardTitle>Transaction activity</CardTitle>
                  <CardDescription>Use the signature prop to expose a direct Solana Explorer link.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <TransactionStatus cluster={cluster === "localnet" ? "devnet" : cluster} state="processing" />
                  <TransactionStatus cluster={cluster === "localnet" ? "devnet" : cluster} state="confirmed" />
                  <TransactionStatus cluster={cluster === "localnet" ? "devnet" : cluster} state="failed" />
                </CardContent>
              </Card>
            </section>

            <section className="scroll-mt-28" id="primitives">
              <SectionHeading index="04" title="UI primitives" description="Small, composable building blocks keep the system consistent." />
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Buttons</CardTitle><CardDescription>Purposeful variants, visible focus, and disabled states.</CardDescription></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button>Continue <ArrowRightIcon /></Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Quiet action</Button>
                    <Button variant="danger">Disconnect</Button>
                    <Button disabled>Unavailable</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Badges</CardTitle><CardDescription>Compact state labels with text and color working together.</CardDescription></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge>Default</Badge><Badge tone="success">Confirmed</Badge><Badge tone="warning">Pending</Badge><Badge tone="danger">Failed</Badge><Badge tone="solana">Solana</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Field</CardTitle><CardDescription>Inputs include a persistent label and a visible focus ring.</CardDescription></CardHeader>
                  <CardContent className="space-y-2">
                    <Label htmlFor="recipient-preview">Recipient address</Label>
                    <Input autoComplete="off" id="recipient-preview" placeholder="Enter a Solana address" />
                    <p className="text-[10px] leading-4 text-[#85847c]">Paste a public address. Never enter a seed phrase here.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Composition</CardTitle><CardDescription>Card slots create predictable spacing as content grows.</CardDescription></CardHeader>
                  <CardContent><div className="rounded-2xl bg-[#f7f6ef] p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#30302a]">Recent activity</span><Badge tone="success">Up to date</Badge></div><Separator className="my-3" /><div className="flex items-center justify-between text-[11px]"><span className="text-[#77766e]">Last checked</span><span className="font-medium tabular-nums text-[#34342e]">Just now</span></div></div></CardContent>
                </Card>
              </div>
            </section>

            <section className="scroll-mt-28" id="integration">
              <SectionHeading index="05" title="Bring your wallet provider" description="Solsjin owns presentation. Your app owns wallet discovery, RPC configuration, signing, and transaction policy." />
              <Card className="mt-5 overflow-hidden">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div><CardTitle>Wallet connection component</CardTitle><CardDescription className="mt-1">Pass state and callbacks from your Solana wallet integration.</CardDescription></div>
                  <Button className="shrink-0" onClick={copySnippet} size="sm" variant="outline">{copiedCode ? "Copied" : "Copy snippet"} <CopyIcon /></Button>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-2xl border border-[#e8e6da] bg-[#171815] p-4 text-[11px] leading-6 text-[#e4e7dc] sm:p-5"><code>{integrationSnippet}</code></pre>
                  <div className="mt-4 grid gap-3 text-[11px] leading-5 text-[#727168] sm:grid-cols-2">
                    <p className="rounded-xl bg-[#f7f6ef] p-3.5"><strong className="text-[#34342e]">Wallet Standard</strong><br />Current Solana wallets can be discovered through the standard. Keep connection approval and signing in the host application.</p>
                    <p className="rounded-xl bg-[#f7f6ef] p-3.5"><strong className="text-[#34342e]">Network-aware explorer links</strong><br />Provide the actual cluster and transaction signature to <code className="rounded bg-white px-1 py-0.5">TransactionStatus</code> for an accurate Explorer destination.</p>
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-4 text-[10px] text-[#85847c]">
                  <span>No private keys or signing logic inside these UI components.</span>
                  <a className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#087c6b] no-underline hover:underline" href="https://solana.com/docs/frontend/nextjs-solana" target="_blank" rel="noreferrer">Solana integration guide <ArrowUpRightIcon /></a>
                </CardFooter>
              </Card>
            </section>
          </div>
          <footer className="mt-16 flex flex-col justify-between gap-3 border-t border-[#e9e7da] pt-5 text-[10px] text-[#85847c] sm:flex-row sm:items-center">
            <p>Open source, made for what comes next.</p>
            <a className="inline-flex items-center gap-1.5 font-medium text-[#55554e] no-underline hover:text-[#087c6b]" href="https://github.com/MisbahAnsar/solsjin" target="_blank" rel="noreferrer">Solsjin on GitHub <ArrowUpRightIcon /></a>
          </footer>
        </main>
      </div>
    </div>
  );
}

function SectionHeading({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-[#0c997f]">{index}</span>
        <h2 className="text-xl font-semibold tracking-[-.045em] text-[#20201b] sm:text-[22px]">{title}</h2>
      </div>
      <p className="max-w-[400px] text-xs leading-5 text-[#85847c] sm:text-right">{description}</p>
    </div>
  );
}

function SolanaGlyph() {
  return <SolanaMark className="size-9 shrink-0 rounded-xl" iconClassName="h-4 w-5" />;
}

function GithubIcon() {
  return <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.13c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.16-2.99-.12-.28-.5-1.42.11-2.95 0 0 .95-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.1-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.16 1.77 1.16 2.99 0 4.27-2.61 5.21-5.1 5.49.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>;
}

function ArrowUpRightIcon() {
  return <svg aria-hidden="true" className="size-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12 12 4M5 4h7v7"/></svg>;
}

function ArrowRightIcon() {
  return <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.5 8h10M8 3.5 12.5 8 8 12.5"/></svg>;
}

function ArrowDownIcon() {
  return <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2.5v10M3.5 8 8 12.5 12.5 8"/></svg>;
}

function CopyIcon() {
  return <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5v-2A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2"/></svg>;
}
