import type { Metadata } from "next";
import { ArrowsLeftRightIcon, BellRingingIcon, CoinsIcon, GithubLogoIcon, GlobeHemisphereWestIcon, ImagesSquareIcon, WalletIcon } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/docs/docs-shell";
import { ThemeToggle } from "@/components/providers/theme";
import { Waitlist } from "@/components/site/waitlist";
import { GITHUB_URL } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";

const title = "Solsjin UI · Launching soon";
const description = "Animated, accessible Solana components that actually work. Leave your email and we'll tell you the moment solsjin launches.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: SITE_URL, siteName: "Solsjin UI", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

const COMING = [
  { icon: WalletIcon, name: "Connect wallet" },
  { icon: ArrowsLeftRightIcon, name: "Swap widget" },
  { icon: CoinsIcon, name: "Token balances" },
  { icon: BellRingingIcon, name: "Transaction toasts" },
  { icon: ImagesSquareIcon, name: "NFT gallery" },
  { icon: GlobeHemisphereWestIcon, name: "Cluster switcher" },
];

export default function ComingSoon() {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-clip">
      <header className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-5">
        <Logo />
        <ThemeToggle className="border-transparent bg-transparent hover:border-transparent hover:bg-fg/[.06]" />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 text-center">
        <p className="glass inline-flex items-center gap-2 rounded-full border border-line py-1 pl-2.5 pr-3 text-xs font-medium text-fg-soft shadow-soft">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          Launching soon
        </p>
        <h1 className="relative mt-7 font-thunder text-[clamp(76px,14vw,196px)] font-bold leading-[.82] tracking-[.01em] text-black dark:text-white">SOLSJIN-UI</h1>
        <p className="relative mt-6 max-w-[580px] text-balance text-[clamp(16px,2vw,21px)] font-medium leading-[1.4] tracking-[-.03em] text-fg-soft">
          Animated, accessible Solana components that actually work. Be the first to know when they ship.
        </p>
        <div className="relative mt-9 flex w-full justify-center">
          <Waitlist cta="Notify me" source="coming-soon" />
        </div>
        <p className="mt-1 text-xs text-faint">One email at launch. No spam, unsubscribe anytime.</p>

        <ul aria-label="What's coming" className="mt-12 grid w-full max-w-[560px] grid-cols-2 gap-2 sm:grid-cols-3">
          {COMING.map(({ icon: Icon, name }) => (
            <li className="flex items-center gap-2 whitespace-nowrap rounded-2xl border border-line bg-card px-3 py-3 text-left text-[12.5px] sm:gap-2.5 sm:px-3.5 sm:text-[13px] font-medium text-fg-soft" key={name}>
              <Icon aria-hidden="true" className="shrink-0 text-fg" size={17} weight="duotone" />
              {name}
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-6 text-[13px] text-muted">
        <span className="text-faint">© 2026 solsjin</span>
        <a className="inline-flex items-center gap-1.5 transition-colors hover:text-fg" href={GITHUB_URL} rel="noreferrer" target="_blank">
          <GithubLogoIcon size={15} weight="bold" /> GitHub
        </a>
      </footer>
    </div>
  );
}
