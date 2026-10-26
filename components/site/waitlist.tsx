"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import { ArrowRightIcon, CheckCircleIcon, EnvelopeSimpleIcon, InfoIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "subscribed" | "exists" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type WaitlistProps = {
  /** Stored with the signup so you can tell where people joined from. */
  source?: string;
  /** Submit button label. */
  cta?: string;
  className?: string;
};

/**
 * Email capture backed by POST /api/waitlist (Postgres). Handles validation, loading, success,
 * already-subscribed and error states, with a hidden honeypot field for bots.
 */
export function Waitlist({ source = "site", cta = "Notify me", className }: WaitlistProps = {}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const tokenRef = useRef<{ at: number; promise: Promise<string> } | null>(null);

  /** Signed form token, fetched once someone shows intent (focus/hover), never on page load. */
  function getToken(fresh = false) {
    const current = tokenRef.current;
    if (!fresh && current && Date.now() - current.at < 90 * 60_000) return current;
    const promise = fetch("/api/waitlist/token", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { token?: string }) => data.token ?? "")
      .catch(() => "");
    tokenRef.current = { at: Date.now(), promise };
    return tokenRef.current;
  }

  async function post(value: string, company: string, fresh = false) {
    const { at, promise } = getToken(fresh);
    const token = await promise;
    const wait = 1700 - (Date.now() - at);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    return fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, source, company, token }),
    });
  }

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage("Enter a valid email address, like you@domain.com.");
      inputRef.current?.focus();
      return;
    }
    const company = (new FormData(event.currentTarget).get("company") as string | null) ?? "";
    setStatus("loading");
    setMessage("");
    try {
      let res = await post(value, company);
      let data = (await res.json().catch(() => ({}))) as { status?: string; code?: string; error?: string };
      if (res.status === 400 && data.code === "token") {
        res = await post(value, company, true);
        data = (await res.json().catch(() => ({}))) as typeof data;
      }
      if (res.ok && data.status === "already_subscribed") {
        setStatus("exists");
        setMessage("You're already on the list. We'll email you at launch.");
      } else if (res.ok) {
        setStatus("subscribed");
        setMessage("You're on the list. We'll email you the moment it ships.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  const done = status === "subscribed" || status === "exists";
  const invalid = status === "error";

  return (
    <div className={cn("w-full max-w-[440px]", className)}>
      <form
        aria-describedby={`${id}-msg`}
        className={cn(
          "relative flex items-center gap-1.5 rounded-full border bg-card p-1.5 pl-4 transition-colors",
          invalid ? "border-danger/60" : "border-line focus-within:border-line-strong",
        )}
        noValidate
        onFocus={() => void getToken()}
        onPointerEnter={() => void getToken()}
        onSubmit={join}
      >
        <EnvelopeSimpleIcon aria-hidden="true" className="shrink-0 text-faint" size={18} />
        <label className="sr-only" htmlFor={`${id}-email`}>
          Email address
        </label>
        <input
          aria-invalid={invalid || undefined}
          autoCapitalize="off"
          autoComplete="email"
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint"
          disabled={status === "loading"}
          id={`${id}-email`}
          inputMode="email"
          maxLength={254}
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error" || done) setStatus("idle");
          }}
          placeholder="you@domain.com"
          ref={inputRef}
          spellCheck={false}
          type="email"
          value={email}
        />
        {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label htmlFor={`${id}-company`}>Company</label>
          <input autoComplete="off" id={`${id}-company`} name="company" tabIndex={-1} type="text" />
        </div>
        <button
          aria-busy={status === "loading" || undefined}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-inv px-5 text-sm font-semibold text-inv-fg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? (
            <>
              <Spinner className="size-3.5" /> Joining
            </>
          ) : (
            <>
              {cta} <ArrowRightIcon size={15} weight="bold" />
            </>
          )}
        </button>
      </form>
      <div aria-live="polite" className="mt-3 min-h-6" id={`${id}-msg`} role="status">
        <AnimatePresence initial={false} mode="wait">
          {message && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-center justify-center gap-1.5 text-[13px]", invalid ? "text-danger" : "text-fg-soft")}
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: 4 }}
              key={message}
              transition={{ duration: 0.2 }}
            >
              {status === "subscribed" && <CheckCircleIcon className="shrink-0 text-accent" size={16} weight="fill" />}
              {status === "exists" && <InfoIcon className="shrink-0 text-fg" size={16} weight="fill" />}
              {invalid && <WarningCircleIcon className="shrink-0" size={16} weight="fill" />}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
