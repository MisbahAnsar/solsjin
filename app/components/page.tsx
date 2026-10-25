import { Clouds } from "@/components/site/clouds";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LightningIcon, PlugsConnectedIcon, TerminalWindowIcon } from "@phosphor-icons/react/ssr";
import { CodeBlock, InlineCommand } from "@/components/ui/code-block";
import { groupedRegistry, REGISTRY } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Components · Solsjin UI",
  description: "Accessible, animated Solana components: wallets, balances, swaps, transactions and more.",
};

const providerCode = `// app/providers.tsx
"use client";
import { SolanaProvider } from "@/components/providers/solana-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}`;

const usageCode = `import { ConnectWallet, SolBalance, SwapWidget } from "@/components/solana";

export default function Page() {
  return (
    <>
      <ConnectWallet />
      <SolBalance address={publicKey} />
      <SwapWidget />
    </>
  );
}`;

export default function ComponentsOverview() {
  const groups = groupedRegistry();
  return (
    <main className="relative px-5 pb-24 pt-10 sm:px-10 lg:px-14">
      <Clouds className="h-[520px]" intensity={0.7} />
      <div className="relative max-w-[920px]">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-faint">Documentation</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-semibold leading-[1.02] tracking-[-.055em] text-balance text-fg">
          Components that <span className="text-muted">actually work</span> on Solana.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-7 text-muted">
          {REGISTRY.length} copy-paste components built on wallet-adapter, web3.js and motion. Real wallet connections, live balances, Jupiter quotes and confirmed transactions, with keyboard, screen-reader and reduced-motion support.
        </p>

        <section aria-labelledby="install" className="mt-12">
          <h2 className="text-lg font-semibold tracking-[-.03em]" id="install">
            Get started
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { icon: TerminalWindowIcon, title: "Install deps", body: <InlineCommand command="bun add @solana/web3.js@1 @solana/wallet-adapter-react @solana/wallet-adapter-base motion @phosphor-icons/react tailwind-merge" /> },
              { icon: LightningIcon, title: "Copy the source", body: <InlineCommand command="npx degit MisbahAnsar/solsjin/components components" /> },
              { icon: PlugsConnectedIcon, title: "Wrap your app", body: <p className="text-[13px] leading-6 text-muted">Add <code className="font-mono text-[12px] text-fg">&lt;SolanaProvider&gt;</code> once. It sets up the cluster, connection, wallets, modal and toasts.</p> },
            ].map((step, index) => (
              <li className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-line bg-card p-4" key={step.title}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-bg-muted text-fg">
                    <step.icon size={16} weight="duotone" />
                  </span>
                  <span className="text-[13px] font-semibold">
                    <span className="mr-1.5 font-mono text-faint">0{index + 1}</span>
                    {step.title}
                  </span>
                </div>
                <div className="min-w-0">{step.body}</div>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CodeBlock code={providerCode} title="app/providers.tsx" />
            <CodeBlock code={usageCode} title="app/page.tsx" />
          </div>
        </section>
      </div>

      {groups.map((group) => (
        <section aria-labelledby={`cat-${group.name}`} className="mt-14" key={group.name}>
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
            <h2 className="text-lg font-semibold tracking-[-.03em]" id={`cat-${group.name}`}>
              {group.name}
            </h2>
            <p className="text-[13px] text-muted">{group.description}</p>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link
                  className="group relative flex h-full flex-col rounded-[20px] border border-line bg-card p-4 transition hover:border-line-strong hover:bg-bg-subtle hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring"
                  href={`/components/${item.slug}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold tracking-[-.02em] text-fg">{item.name}</span>
                    {item.isNew && <span className="rounded-full bg-accent-soft px-1.5 py-px text-[10px] font-semibold text-accent-fg dark:text-accent">New</span>}
                    {item.live && <span className="rounded-full bg-bg-muted px-1.5 py-px text-[10px] font-semibold text-muted">Live</span>}
                  </span>
                  <span className="mt-1.5 text-[13px] leading-5 text-muted">{item.summary}</span>
                  <ArrowRightIcon className="absolute right-4 top-4 text-faint opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" size={14} weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
