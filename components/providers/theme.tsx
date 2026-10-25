"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const THEME_STORAGE_KEY = "solsjin-theme";

/** Inline, render-blocking script that applies the saved theme before first paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

type Theme = "light" | "dark";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => "light");
  function setTheme(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable
    }
  }
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative grid size-9 place-items-center overflow-hidden rounded-full border border-line bg-card text-fg-soft transition hover:border-line-strong hover:text-fg",
        className,
      )}
      onClick={toggle}
      type="button"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          className="grid place-items-center"
          exit={{ y: -18, rotate: 40, opacity: 0 }}
          initial={{ y: 18, rotate: -40, opacity: 0 }}
          key={theme}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {dark ? <MoonIcon size={16} weight="duotone" /> : <SunIcon size={16} weight="duotone" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
