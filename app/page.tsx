import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CodeIcon,
  DropHalfIcon,
  GithubLogoIcon,
  KeyboardIcon,
  LightningIcon,
  MoonStarsIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/docs/docs-shell";
import { GITHUB_URL } from "@/lib/site";
import { Clouds } from "@/components/site/clouds";
import { GooOrb } from "@/components/site/goo-orb";
import { LiquidMetalButton } from "@/components/motion/liquid-metal-button";
import { Playground } from "@/components/site/playground";
import { SiteHeader } from "@/components/site/site-header";
import { Waitlist } from "@/components/site/waitlist";
import { buttonClasses } from "@/components/ui/button";
import { CodeBlock, InlineCommand } from "@/components/ui/code-block";
import { REGISTRY } from "@/lib/registry";

const FEATURES = [
  { icon: WalletIcon, title: "Real wallet flows", body: "Wallet Standard detection, a polished modal, an empty state for users without a wallet, and auto-reconnect." },
  { icon: LightningIcon, title: "Live on-chain data", body: "Websocket balances, RPC health, Jupiter quotes and prices. Every component handles loading and error states." },
  { icon: DropHalfIcon, title: "Gooey motion", body: "One SVG goo primitive powers tabs, the wallet menu and toasts. It switches off for prefers-reduced-motion." },
  { icon: KeyboardIcon, title: "Accessible", body: "Focus traps, roving tabindex, ARIA patterns and live regions. Everything works with a keyboard." },
  { icon: MoonStarsIcon, title: "Light and dark", body: "Token-based theming with no flash on load. Copy a file and it matches your brand." },
  { icon: CodeIcon, title: "You own the code", body: "No package lock-in. Copy the source, tweak it and ship it. Typed props, documented APIs." },
];

const STEPS = [
  { title: "Install the deps", code: "bun add @solana/web3.js@1 @solana/wallet-adapter-react @solana/wallet-adapter-base motion @phosphor-icons/react" },
  { title: "Copy the components", code: "npx degit MisbahAnsar/solsjin/components components" },
];

const providerSnippet = `import { SolanaProvider } from "@/components/providers/solana-provider";
import { ConnectWallet, SwapWidget } from "@/components/solana";

export default function App() {
  return (
    <SolanaProvider>
      <ConnectWallet />
      <SwapWidget />
    </SolanaProvider>
  );
}`;

export default function Home() {
  const names = REGISTRY.map((entry) => entry.name);
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />

      <main>
        <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-20 pt-32 text-center" id="top">
          <Clouds />
          <Link className="glass relative inline-flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-xs font-medium text-fg-soft shadow-soft transition-colors hover:border-line-strong hover:text-fg" href="/components/swap-widget">
            <span className="rounded-full bg-inv px-2 py-0.5 text-[10px] font-semibold text-inv-fg">New</span>
            Jupiter swap widget and gooey toasts
            <ArrowRightIcon size={12} weight="bold" />
          </Link>
          <h1 className="relative mt-7 font-thunder text-[clamp(76px,14vw,196px)] font-bold leading-[.82] tracking-[.01em] text-black dark:text-white" id="hero-title">
            SOLSJIN-UI
          </h1>
          <p className="relative mt-6 max-w-[620px] text-balance text-[clamp(16px,2vw,21px)] font-medium leading-[1.4] tracking-[-.03em] text-fg-soft">
            Animated, accessible Solana components that actually work. Wallets, balances, swaps and transactions, ready to copy and paste.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <LiquidMetalButton href="/components" size="lg">
              Browse components <ArrowRightIcon size={16} weight="bold" />
            </LiquidMetalButton>
            <a className={buttonClasses({ size: "lg", variant: "outline", className: "rounded-full px-6" })} href={GITHUB_URL} rel="noreferrer" target="_blank">
              <GithubLogoIcon size={17} weight="bold" /> Star on GitHub
            </a>
          </div>
          <div className="relative mt-6 w-full max-w-[460px]">
            <InlineCommand command="npx degit MisbahAnsar/solsjin/components components" />
          </div>
        </section>

        <div aria-label="Included components" className="relative overflow-hidden border-y border-line bg-bg-subtle/60 py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]" role="region">
          <ul className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
            {[...names, ...names].map((name, index) => (
              <li aria-hidden={index >= names.length || undefined} className="flex items-center gap-10 whitespace-nowrap text-[13px] font-medium text-muted" key={`${name}-${index}`}>
                {name}
                <span aria-hidden="true" className="size-1 rounded-full bg-faint" />
              </li>
            ))}
          </ul>
        </div>

        <section aria-labelledby="playground-title" className="relative mx-auto max-w-[1180px] scroll-mt-24 px-5 py-24" id="playground">
          <Clouds className="-inset-x-40" intensity={0.8} />
          <div className="relative mx-auto max-w-[720px] text-center">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-faint">Playground</p>
            <h2 className="mt-3 text-[clamp(30px,4.4vw,48px)] font-semibold leading-[1.02] tracking-[-.055em] text-balance" id="playground-title">
              Not screenshots. <span className="text-muted">Live components.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-balance text-[15px] leading-7 text-muted">Connect a wallet, switch clusters and get a real Jupiter quote. Everything below talks to Solana.</p>
          </div>
          <div className="relative mt-12">
            <Playground />
          </div>
        </section>

        <section aria-labelledby="features-title" className="mx-auto max-w-[1180px] px-5 pb-24">
          <h2 className="sr-only" id="features-title">
            Features
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li className="bg-card p-6 transition-colors duration-200 hover:bg-bg-subtle" key={feature.title}>
                <span className="grid size-10 place-items-center rounded-2xl border border-line bg-bg-subtle text-fg">
                  <feature.icon size={20} weight="duotone" />
                </span>
                <h3 className="mt-5 text-[15px] font-semibold tracking-[-.02em]">{feature.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="install-title" className="mx-auto grid max-w-[1180px] scroll-mt-24 gap-10 px-5 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" id="install">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-faint">Install</p>
            <h2 className="mt-3 text-[clamp(30px,4.4vw,44px)] font-semibold leading-[1.02] tracking-[-.055em]" id="install-title">
              Shipping in three steps.
            </h2>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((step, index) => (
                <li className="flex gap-4" key={step.title}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-muted">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-sm font-semibold">{step.title}</p>
                    <InlineCommand command={step.code} />
                  </div>
                </li>
              ))}
              <li className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-muted">3</span>
                <div>
                  <p className="text-sm font-semibold">Wrap your app and compose</p>
                  <p className="mt-1 text-[13px] leading-6 text-muted">One provider sets up the cluster, connection, wallets, modal and toasts.</p>
                </div>
              </li>
            </ol>
          </div>
          <CodeBlock code={providerSnippet} lineNumbers title="app/page.tsx" />
        </section>

        <section aria-labelledby="cta-title" className="px-5 pb-24">
          <div className="relative mx-auto flex max-w-[1180px] flex-col items-center overflow-hidden rounded-[32px] border border-line bg-bg-subtle px-6 py-16 text-center">
            <Clouds intensity={1.2} />
            <GooOrb className="pointer-events-none absolute -right-24 -top-28 size-[320px] opacity-20" />
            <ShieldCheckIcon className="relative text-fg" size={28} weight="duotone" />
            <h2 className="relative mt-4 text-[clamp(28px,4vw,40px)] font-semibold tracking-[-.05em]" id="cta-title">
              Get launch updates
            </h2>
            <p className="relative mt-2 max-w-[44ch] text-sm leading-6 text-muted">New components, blocks and templates. No spam, just ships.</p>
            <div className="relative mt-6 flex w-full justify-center">
              <Waitlist />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-5 py-8 text-[13px] text-muted sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-faint">Open source, made for what comes next.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link className="transition hover:text-fg" href="/components">
              Components
            </Link>
            <a className="inline-flex items-center gap-1 transition hover:text-fg" href={GITHUB_URL} rel="noreferrer" target="_blank">
              GitHub <ArrowUpRightIcon size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
