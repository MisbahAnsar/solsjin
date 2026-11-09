import { Clouds } from "@/components/site/clouds";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LightningIcon, PlugsConnectedIcon, TerminalWindowIcon } from "@phosphor-icons/react/ssr";
import { CodeBlock, InlineCommand } from "@/components/ui/code-block";
import { groupedRegistry, REGISTRY } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Components · Solsjin UI",
  description: "Copy-paste Solana components for wallets, balances, swaps, transactions and motion — accessible and ready to ship.",
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

const STEPS = [
  {
    icon: TerminalWindowIcon,
    title: "Install dependencies",
    body: <InlineCommand command="bun add @solana/web3.js@1 @solana/wallet-adapter-react @solana/wallet-adapter-base motion @phosphor-icons/react tailwind-merge" />,
  },
  {
    icon: LightningIcon,
    title: "Copy the components",
    body: <InlineCommand command="npx degit MisbahAnsar/solsjin/components components" />,
  },
  {
    icon: PlugsConnectedIcon,
    title: "Wrap your app",
    body: (
      <p className="text-[13px] leading-6 text-muted">
        Mount <code className="font-mono text-[12px] text-fg">&lt;SolanaProvider&gt;</code> once. It wires up the cluster, RPC connection, wallets, modal and toasts for every component below.
      </p>
    ),
  },
];

export default function ComponentsOverview() {
  const groups = groupedRegistry();
  const liveCount = REGISTRY.filter((entry) => entry.live).length;

  return (
    <main className="relative px-5 pb-24 pt-16 sm:px-10 sm:pt-20 lg:px-14 lg:pt-24">
      <Clouds className="h-[520px]" intensity={0.7} />
      <div className="relative max-w-[920px]">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-faint">Component library</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,52px)] font-semibold leading-[1.02] tracking-[-.055em] text-balance text-fg">
          Solana UI you can copy into your app.
        </h1>
        <p className="mt-5 max-w-[58ch] text-[15px] leading-7 text-muted">
          {REGISTRY.length} production-ready components for wallets, balances, swaps and transactions. Built on wallet-adapter and web3.js, animated with motion, and designed for keyboard, screen readers and reduced motion.
        </p>
        <p className="mt-3 text-[13px] leading-5 text-faint">
          {liveCount} components talk to a live RPC in the docs. The rest are presentational and work offline.
        </p>

        <section aria-labelledby="install" className="mt-14">
          <div className="max-w-[58ch]">
            <h2 className="text-lg font-semibold tracking-[-.03em]" id="install">
              Get started
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">
              Three steps. Own the source after that — no package lock-in, no private registry.
            </p>
          </div>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-line bg-card p-4" key={step.title}>
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-bg-muted text-fg">
                    <step.icon size={16} weight="duotone" />
                  </span>
                  <span className="text-[13px] font-semibold">
                    <span className="mr-1.5 font-mono text-faint">{String(index + 1).padStart(2, "0")}</span>
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

      <section aria-labelledby="browse" className="relative mt-20 max-w-[920px]">
        <h2 className="text-lg font-semibold tracking-[-.03em]" id="browse">
          Browse by category
        </h2>
        <p className="mt-2 max-w-[58ch] text-[14px] leading-6 text-muted">
          Open any component for a live preview, props, accessibility notes and the source you copy.
        </p>
      </section>

      {groups.map((group) => (
        <section aria-labelledby={`cat-${group.name}`} className="mt-12 max-w-[920px]" key={group.name}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[15px] font-semibold tracking-[-.02em]" id={`cat-${group.name}`}>
              {group.name}
            </h2>
            <p className="text-[13px] leading-5 text-muted">{group.description}</p>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link
                  className="group flex items-center gap-4 py-3.5 transition-colors hover:bg-fg/[.03] focus-visible:bg-fg/[.03] focus-visible:outline-none sm:gap-6 sm:px-1"
                  href={`/components/${item.slug}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold tracking-[-.02em] text-fg transition-colors group-hover:text-fg">{item.name}</span>
                      {item.isNew && <span className="rounded-full bg-accent-soft px-1.5 py-px text-[10px] font-semibold text-accent-fg dark:text-accent">New</span>}
                      {item.live && <span className="rounded-full bg-bg-muted px-1.5 py-px text-[10px] font-semibold text-muted">Live</span>}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-muted sm:hidden">{item.summary}</span>
                  </span>
                  <span className="hidden min-w-0 flex-[1.4] text-[13px] leading-5 text-muted sm:block">{item.summary}</span>
                  <ArrowRightIcon className="shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" size={14} weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
