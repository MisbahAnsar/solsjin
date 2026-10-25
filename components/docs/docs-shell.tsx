"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  ArrowRightIcon,
  CubeIcon,
  GithubLogoIcon,
  ListIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  XIcon,
} from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/providers/theme";
import { ConnectWallet } from "@/components/solana/connect-wallet";
import { ClusterBadge } from "@/components/solana/cluster-badge";
import { Dialog } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { LiquidGlass, ScrollEdge } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

export type NavItem = { slug: string; name: string; category: string; summary: string; keywords: string[]; isNew?: boolean };
export type NavGroup = { name: string; items: NavItem[] };

import { GITHUB_URL } from "@/lib/site";

function matches(item: NavItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${item.name} ${item.category} ${item.summary} ${item.keywords.join(" ")}`.toLowerCase().includes(q);
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link aria-label="Solsjin UI home" className={cn("flex items-center gap-2 text-fg", className)} href="/">
      <span aria-hidden="true" className="relative grid size-7 place-items-center overflow-hidden rounded-[9px] bg-inv">
        <span className="absolute size-3.5 -translate-x-1 -translate-y-0.5 rounded-full bg-sol-green blur-[0.5px]" />
        <span className="absolute size-3 translate-x-1.5 translate-y-1 rounded-full bg-sol-purple blur-[0.5px]" />
      </span>
      <span className="text-[15px] font-semibold tracking-[-.04em]">solsjin</span>
      <span className="rounded-md border border-line px-1.5 py-px font-mono text-[10px] text-muted">ui</span>
    </Link>
  );
}

function Sidebar({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => groups.map((group) => ({ ...group, items: group.items.filter((item) => matches(item, query)) })).filter((group) => group.items.length), [groups, query]);
  const count = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <nav aria-label="Components" className="flex h-full flex-col">
      <div className="px-3 pb-3 pt-1">
        <label className="relative block">
          <span className="sr-only">Filter components</span>
          <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={14} weight="bold" />
          <input
            className="h-9 w-full rounded-xl border border-line bg-bg-subtle pl-8 pr-3 text-[13px] text-fg outline-none transition placeholder:text-faint focus:border-line-strong focus:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter…"
            type="search"
            value={query}
          />
        </label>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
        <Link
          aria-current={pathname === "/components" ? "page" : undefined}
          className={cn(
            "mb-4 flex h-9 items-center gap-2 rounded-xl px-2.5 text-[13px] font-medium transition",
            pathname === "/components" ? "bg-bg-muted text-fg" : "text-fg-soft hover:bg-bg-subtle hover:text-fg",
          )}
          href="/components"
          onClick={onNavigate}
        >
          <SquaresFourIcon size={15} weight="duotone" /> Overview
        </Link>
        {filtered.map((group) => (
          <div className="mb-5" key={group.name}>
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[.12em] text-faint">{group.name}</p>
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => {
                const active = pathname === `/components/${item.slug}`;
                return (
                  <li key={item.slug}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-8 items-center justify-between rounded-lg px-2.5 text-[13px] transition",
                        active ? "font-semibold text-fg" : "text-muted hover:bg-bg-subtle hover:text-fg",
                      )}
                      href={`/components/${item.slug}`}
                      onClick={onNavigate}
                    >
                      {active && <motion.span className="absolute inset-0 -z-10 rounded-lg bg-bg-muted" layoutId="sidebar-active" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      {item.name}
                      {item.isNew && <span className="rounded-full bg-accent-soft px-1.5 py-px text-[9.5px] font-semibold text-accent-fg dark:text-accent">New</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {count === 0 && (
          <div className="mx-1 rounded-2xl border border-dashed border-line px-3 py-6 text-center">
            <CubeIcon className="mx-auto text-faint" size={22} weight="duotone" />
            <p className="mt-2 text-xs font-medium text-fg-soft">No components match “{query}”</p>
            <button className="mt-2 text-xs font-semibold text-muted underline-offset-4 hover:text-fg hover:underline" onClick={() => setQuery("")} type="button">
              Clear filter
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export function CommandMenu({ groups, open, onOpenChange }: { groups: NavGroup[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const items = useMemo(() => groups.flatMap((g) => g.items).filter((item) => matches(item, query)), [groups, query]);
  const safeActive = Math.min(active, Math.max(items.length - 1, 0));

  function go(item: NavItem | undefined) {
    if (!item) return;
    onOpenChange(false);
    setQuery("");
    router.push(`/components/${item.slug}`);
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${safeActive}"]`)?.scrollIntoView({ block: "nearest" });
  }, [safeActive]);

  return (
    <Dialog hideHeader onOpenChange={onOpenChange} open={open} position="top" title="Search components">
      <div className="flex items-center gap-2 border-b border-line px-4">
        <MagnifyingGlassIcon aria-hidden="true" className="text-faint" size={16} weight="bold" />
        <input
          aria-activedescendant={items[safeActive] ? `cmd-${items[safeActive].slug}` : undefined}
          aria-autocomplete="list"
          aria-controls="cmd-list"
          aria-expanded="true"
          aria-label="Search components"
          className="h-13 flex-1 bg-transparent py-4 text-[15px] text-fg outline-none placeholder:text-faint"
          data-autofocus
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((safeActive + 1) % Math.max(items.length, 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((safeActive - 1 + items.length) % Math.max(items.length, 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              go(items[safeActive]);
            }
          }}
          placeholder="Search wallet, swap, toast…"
          role="combobox"
          value={query}
        />
        <Kbd>Esc</Kbd>
      </div>
      <ul className="scrollbar-thin max-h-[min(60vh,420px)] overflow-y-auto p-2" id="cmd-list" ref={listRef} role="listbox">
        {items.map((item, index) => (
          <li
            aria-selected={index === safeActive}
            className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", index === safeActive ? "bg-bg-muted" : "hover:bg-bg-subtle")}
            data-index={index}
            id={`cmd-${item.slug}`}
            key={item.slug}
            onClick={() => go(item)}
            onMouseMove={() => setActive(index)}
            role="option"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-card text-muted">
              <CubeIcon size={15} weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-fg">{item.name}</span>
              <span className="block truncate text-xs text-muted">{item.summary}</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[.1em] text-faint">{item.category}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-3 py-10 text-center text-sm text-muted" role="presentation">
            Nothing found for “{query}”.
          </li>
        )}
      </ul>
    </Dialog>
  );
}

export function DocsShell({ groups, children }: { groups: NavGroup[]; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [command, setCommand] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 2));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-40">
        <ScrollEdge active={scrolled} height={64} tint={0.62} variant="bar" />
        <div className="relative mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <button aria-expanded={drawer} aria-label="Open navigation" className="grid size-9 place-items-center rounded-xl text-fg-soft hover:bg-bg-muted lg:hidden" onClick={() => setDrawer(true)} type="button">
            <ListIcon size={18} weight="bold" />
          </button>
          <Logo />
          <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <Link className="hidden text-[13px] font-medium text-muted transition hover:text-fg sm:block" href="/components">
            Components
          </Link>
          <button
            className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-line bg-bg-subtle/70 pl-3 pr-1.5 text-[13px] text-faint transition hover:border-line-strong hover:text-muted md:w-[260px]"
            onClick={() => setCommand(true)}
            type="button"
          >
            <MagnifyingGlassIcon size={14} weight="bold" />
            <span className="hidden flex-1 text-left md:block">Search components…</span>
            <Kbd className="hidden md:inline-flex">⌘K</Kbd>
            <span className="sr-only md:hidden">Search</span>
          </button>
          <div className="hidden sm:block">
            <ClusterBadge />
          </div>
          <a aria-label="GitHub repository" className="hidden size-9 place-items-center rounded-xl text-fg-soft transition hover:bg-bg-muted hover:text-fg sm:grid" href={GITHUB_URL} rel="noreferrer" target="_blank">
            <GithubLogoIcon size={18} weight="bold" />
          </a>
          <ThemeToggle />
          <ConnectWallet className="hidden md:inline-flex" label="Connect" size="sm" />
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[264px] shrink-0 border-r border-line pt-5 lg:block">
          <Sidebar groups={groups} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div animate={{ opacity: 1 }} className="absolute inset-0 bg-[rgb(8_8_8/0.22)] backdrop-blur-[3px]" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.div
              animate={{ x: 0 }}
              aria-label="Navigation"
              aria-modal="true"
              className="absolute inset-y-2 left-2 w-[300px] max-w-[calc(100vw-3rem)]"
              exit={{ x: "calc(-100% - 16px)" }}
              initial={{ x: "calc(-100% - 16px)" }}
              onKeyDown={(event) => event.key === "Escape" && setDrawer(false)}
              role="dialog"
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <LiquidGlass className="flex h-full flex-col overflow-hidden pt-3" material="thick" radius={28}>
                <div className="flex items-center justify-between px-4 pb-3">
                  <Logo />
                  <button aria-label="Close navigation" autoFocus className="grid size-9 place-items-center rounded-xl hover:bg-bg-muted" onClick={() => setDrawer(false)} type="button">
                    <XIcon size={17} weight="bold" />
                  </button>
                </div>
                <div className="px-4 pb-3 md:hidden">
                  <ConnectWallet className="w-full" size="sm" />
                </div>
                <div className="min-h-0 flex-1">
                  <Sidebar groups={groups} onNavigate={() => setDrawer(false)} />
                </div>
              </LiquidGlass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CommandMenu groups={groups} onOpenChange={setCommand} open={command} />
    </div>
  );
}

export function NextLink({ href, label, direction }: { href: string; label: string; direction: "prev" | "next" }) {
  return (
    <Link className={cn("group flex flex-1 flex-col rounded-2xl border border-line p-4 transition hover:border-line-strong hover:bg-bg-subtle", direction === "next" && "items-end text-right")} href={href}>
      <span className="text-[11px] font-medium text-faint">{direction === "prev" ? "Previous" : "Next"}</span>
      <span className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-fg">
        {direction === "prev" && <ArrowRightIcon className="rotate-180 transition group-hover:-translate-x-0.5" size={13} weight="bold" />}
        {label}
        {direction === "next" && <ArrowRightIcon className="transition group-hover:translate-x-0.5" size={13} weight="bold" />}
      </span>
    </Link>
  );
}
