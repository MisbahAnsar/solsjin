"use client";

import { type FormEvent, useState } from "react";
import { ArrowUpRightIcon, CheckCircleIcon } from "@phosphor-icons/react";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    const saved = JSON.parse(localStorage.getItem("solsjin-waitlist") ?? "[]") as string[];
    if (!saved.includes(normalized)) localStorage.setItem("solsjin-waitlist", JSON.stringify([...saved, normalized]));
    setMessage("You're on the list. Saved on this device.");
    setEmail("");
  }

  return (
    <div className="w-full max-w-[420px]">
      <form className="flex h-[52px] gap-1.5 rounded-[18px] border border-line bg-card p-1.5 shadow-soft focus-within:border-line-strong" onSubmit={join}>
        <label className="sr-only" htmlFor="waitlist-email">
          Email address
        </label>
        <input
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent px-3 text-[13px] text-fg outline-none placeholder:text-faint"
          id="waitlist-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@protocol.xyz"
          required
          type="email"
          value={email}
        />
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-inv px-4 text-[13px] font-semibold text-inv-fg transition hover:opacity-90 active:scale-[.98]" type="submit">
          Get updates <ArrowUpRightIcon size={14} weight="bold" />
        </button>
      </form>
      <p aria-live="polite" className="mt-2 flex min-h-5 items-center justify-center gap-1.5 text-xs text-muted">
        {message && (
          <>
            <CheckCircleIcon className="text-accent" size={14} weight="fill" /> {message}
          </>
        )}
      </p>
    </div>
  );
}
