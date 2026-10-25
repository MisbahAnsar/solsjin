"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { GithubLogoIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/docs/docs-shell";
import { ThemeToggle } from "@/components/providers/theme";
import { ConnectWallet } from "@/components/solana/connect-wallet";
import { LiquidGlass, ScrollEdge } from "@/components/ui/liquid-glass";
import { GITHUB_URL } from "@/lib/site";

const LINKS = [
  { href: "/components", label: "Components" },
  { href: "#playground", label: "Playground" },
  { href: "#install", label: "Install" },
];

/** Same spring the glass uses everywhere: settles in ~0.45s with no visible wobble. */
const morph = { type: "spring" as const, stiffness: 300, damping: 34, mass: 0.9 };

/**
 * Floating liquid-glass nav. At the top of the page it is a wide, nearly clear bar; once content
 * starts scrolling under it, it draws in to a compact pill, its tint thickens a touch, and a
 * progressive blur fades in along the top edge of the viewport so content never hits a hard line.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [compact, setCompact] = useState(false);

  // Hysteresis so the bar never flickers between states around the threshold.
  useMotionValueEvent(scrollY, "change", (y) => setCompact((prev) => (prev ? y > 12 : y > 40)));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <ScrollEdge active={compact} height={92} />
      <div className="relative px-3 pt-3">
        <motion.div
          animate={{ maxWidth: compact ? 780 : 1080, y: compact ? -2 : 0 }}
          className="pointer-events-auto mx-auto"
          initial={false}
          style={{ maxWidth: 1080 }}
          transition={reduce ? { duration: 0 } : morph}
        >
          <LiquidGlass className="flex h-14 items-center gap-2 pl-4 pr-1.5" material={compact ? "regular" : "clear"} radius={9999} refraction>
            <Logo />
            <nav aria-label="Main" className="ml-5 hidden items-center gap-0.5 md:flex">
              {LINKS.map((link) => (
                <Link
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted transition-colors duration-200 hover:bg-fg/[.06] hover:text-fg"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-1">
              <a
                aria-label="GitHub repository"
                className="grid size-9 place-items-center rounded-full text-fg-soft transition-colors duration-200 hover:bg-fg/[.06] hover:text-fg"
                href={GITHUB_URL}
                rel="noreferrer"
                target="_blank"
              >
                <GithubLogoIcon size={18} weight="bold" />
              </a>
              <ThemeToggle className="border-transparent bg-transparent hover:border-transparent hover:bg-fg/[.06]" />
              <ConnectWallet className="hidden sm:inline-flex" label="Connect" size="sm" />
            </div>
          </LiquidGlass>
        </motion.div>
      </div>
    </header>
  );
}
