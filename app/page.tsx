"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

const githubUrl = "https://github.com/MisbahAnsar/solsjin";

function GithubMark() {
  return (
    <svg className="h-[18px] w-[18px]" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.13c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.16-2.99-.12-.28-.5-1.42.11-2.95 0 0 .95-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.1-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.16 1.77 1.16 2.99 0 4.27-2.61 5.21-5.1 5.49.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const savedEmails = JSON.parse(localStorage.getItem("solsjin-waitlist") ?? "[]") as string[];
    if (!savedEmails.includes(normalizedEmail)) {
      localStorage.setItem("solsjin-waitlist", JSON.stringify([...savedEmails, normalizedEmail]));
    }
    setMessage("Email saved on this device. Thanks for your interest!");
    setEmail("");
  }

  return (
    <main className="relative flex h-screen h-[100svh] min-h-0 flex-col overflow-hidden bg-paper px-6 pb-[22px] pt-[67px] text-ink max-[900px]:px-[18px] max-[900px]:pb-4 max-[900px]:pt-[59px] max-[560px]:px-[14px] max-[560px]:pb-[14px] max-[560px]:pt-[55px]">
      <header className="absolute left-1/2 top-[3px] z-10 flex min-h-16 w-[820px] max-w-[calc(100vw-48px)] -translate-x-1/2 items-center justify-between rounded-[23px] border border-[#e9e7da] bg-[#f0efe5] px-[9px] py-[7px] pl-[58px] shadow-[0_4px_16px_#231f1208] max-[900px]:min-h-14 max-[900px]:w-[calc(100vw-40px)] max-[900px]:rounded-[17px] max-[900px]:pl-6 max-[560px]:min-h-[52px] max-[560px]:w-[calc(100vw-28px)] max-[560px]:rounded-2xl max-[560px]:px-[6px] max-[560px]:py-[5px] max-[560px]:pl-4">
        <a className="text-[18px] font-semibold tracking-[-.055em] text-ink no-underline max-[900px]:text-[17px] max-[560px]:text-[15px]" href="#top" aria-label="Solsjin home">SOLSJIN</a>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link className="inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-xs font-medium text-[#55554e] no-underline transition-colors hover:bg-white/70 hover:text-ink max-[560px]:min-h-9 max-[560px]:px-2 max-[560px]:text-[10px]" href="/components">Components</Link>
          <a className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-ink px-[18px] text-[15px] font-medium text-white no-underline transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#242424] motion-reduce:transition-none max-[900px]:min-h-10 max-[900px]:rounded-[13px] max-[900px]:text-[13px] max-[560px]:min-h-[38px] max-[560px]:rounded-xl max-[560px]:px-3 max-[560px]:text-[11px]" href="#waitlist">Get launch updates</a>
        </div>
      </header>

      <section className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-0 py-[14px] pt-[52px] text-center max-[900px]:pt-[42px] min-[1500px]:pt-14 min-[1500px]:pb-[38px] max-[560px]:py-5 max-[560px]:pt-[52px]" id="top" aria-labelledby="hero-title">
        <div className="flex flex-col items-center">
          <h1 className="m-0 whitespace-nowrap font-thunder text-[clamp(68px,9.5vw,156px)] font-bold leading-[108px] tracking-[.01em] max-[900px]:leading-[.78] min-[1500px]:text-[156px] max-[560px]:text-[clamp(50px,13.4vw,76px)] max-[560px]:leading-[.84] max-[560px]:tracking-normal" id="hero-title">SOLSJIN-UI</h1>
          <p className="my-6 mt-[21px] max-w-[740px] text-[23px] font-medium leading-[1.26] tracking-[-.04em] max-[900px]:mt-[19px] max-[900px]:text-[clamp(17px,2.7vw,22px)] max-[560px]:my-[19px] max-[560px]:mt-[18px] max-[560px]:max-w-[320px] max-[560px]:text-base max-[560px]:leading-[1.3] max-[560px]:tracking-[-.035em]">
            A modern, animated, and developer-first UI library to shape<br className="max-[560px]:hidden" />
            the future of Solana.
          </p>
          <a className="inline-flex min-h-[38px] items-center gap-[9px] rounded-full border border-[#161616] bg-[#5a5a58] px-[14px] text-[15px] font-normal text-white no-underline shadow-[0_2px_0_#00000012] transition-[background,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#242424] motion-reduce:transition-none max-[560px]:min-h-9 max-[560px]:text-sm" href={githubUrl} target="_blank" rel="noreferrer">
            Star us on <GithubMark />
          </a>
        </div>

        <form className="mt-[26px] flex min-h-[50px] w-full max-w-[410px] gap-[6px] rounded-[17px] border border-[#e3e1d5] bg-[#fffef8] p-[5px] shadow-[0_8px_28px_#1412080a] max-[900px]:mt-4 max-[560px]:mt-[22px] max-[560px]:min-h-[46px]" id="waitlist" onSubmit={joinWaitlist}>
          <label className="sr-only" htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Your email for launch updates"
            autoComplete="email"
            required
            className="w-0 min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] text-ink outline-none placeholder:text-[#85847c] max-[560px]:pl-2 max-[560px]:text-[11px]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="inline-flex min-w-[116px] items-center justify-center gap-[10px] rounded-xl border-0 bg-[#090909] px-4 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#333] max-[560px]:min-w-[98px] max-[560px]:px-[9px] max-[560px]:text-[11px]" type="submit">Notify me <span className="text-[17px]" aria-hidden="true">↗</span></button>
        </form>
        {message && <p className="mt-2 min-h-[18px] text-[11px] tracking-[.01em] text-[#77766e] max-[560px]:max-w-[290px] max-[560px]:text-[9px]" aria-live="polite">{message}</p>}

      </section>
      <footer className="text-center text-[11px] tracking-[.02em] text-[#85847c] max-[560px]:mt-auto max-[560px]:pt-3 max-[560px]:text-[9px]">Open source, made for what comes next.</footer>
    </main>
  );
}
