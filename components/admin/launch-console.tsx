"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { DownloadSimpleIcon, LockKeyIcon, PaperPlaneTiltIcon, RocketLaunchIcon, SignOutIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Logo } from "@/components/docs/docs-shell";
import { LiquidMetalButton } from "@/components/motion/liquid-metal-button";
import { ThemeToggle } from "@/components/providers/theme";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_BODY, DEFAULT_SUBJECT } from "@/lib/launch-copy";
import { cn } from "@/lib/utils";

type Session = { authed: boolean; configured: { admin: boolean; database?: boolean; email?: boolean; from?: string | null } };
type Stats = { total: number; pending: number; notified: number; unsubscribed: number };
type Row = { id: string; email: string; source: string | null; created_at: string; notified_at: string | null; unsubscribed_at: string | null };
type Notice = { tone: "muted" | "danger" | "success"; text: string } | null;

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export function LaunchConsole() {
  const [session, setSession] = useState<Session | null>(null);

  const refreshSession = useCallback(async () => {
    const { data } = await api<Session>("/api/admin/session");
    setSession(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void refreshSession();
  }, [refreshSession]);

  return (
    <div className="min-h-[100svh] bg-bg">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-muted">admin</span>
        </div>
        <div className="flex items-center gap-2">
          {session?.authed && (
            <Button
              onClick={async () => {
                await api("/api/admin/logout", { method: "POST" });
                void refreshSession();
              }}
              size="sm"
              variant="ghost"
            >
              <SignOutIcon size={14} /> Sign out
            </Button>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-5 pb-20">
        {!session ? (
          <div className="grid place-items-center py-32">
            <Spinner label="Loading" />
          </div>
        ) : session.authed ? (
          <Dashboard session={session} />
        ) : (
          <Login configured={session.configured.admin} onDone={refreshSession} />
        )}
      </main>
    </div>
  );
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { ok, data } = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    setBusy(false);
    if (ok) {
      setPassword("");
      onDone();
    } else setError(data.error ?? "Sign in failed.");
  }

  return (
    <form className="mx-auto mt-20 flex max-w-[380px] flex-col gap-4 rounded-[24px] border border-line bg-card p-6 shadow-soft" onSubmit={submit}>
      <span className="grid size-10 place-items-center rounded-2xl border border-line bg-bg-subtle">
        <LockKeyIcon size={20} weight="duotone" />
      </span>
      <div>
        <h1 className="text-lg font-semibold tracking-[-.03em]">Launch console</h1>
        <p className="mt-1 text-[13px] leading-5 text-muted">{configured ? "Enter the admin secret to continue." : "Set ADMIN_SECRET (12+ characters) in your environment to enable this page."}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-password">Admin secret</Label>
        <Input autoComplete="current-password" disabled={!configured} id="admin-password" invalid={Boolean(error)} onChange={(e) => setPassword(e.target.value)} type="password" value={password} />
        {error && (
          <FieldHint role="alert" tone="danger">
            {error}
          </FieldHint>
        )}
      </div>
      <Button disabled={!configured || !password} loading={busy} type="submit">
        Sign in
      </Button>
    </form>
  );
}

function Dashboard({ session }: { session: Session }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadError, setLoadError] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [testTo, setTestTo] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testNotice, setTestNotice] = useState<Notice>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<{ sent: number; remaining: number } | null>(null);
  const [launchNotice, setLaunchNotice] = useState<Notice>(null);

  const load = useCallback(async () => {
    const { ok, data } = await api<{ stats: Stats; rows: Row[] }>("/api/admin/subscribers");
    if (!ok) return setLoadError(data.error ?? "Could not load subscribers.");
    setLoadError("");
    setStats(data.stats);
    setRows(data.rows);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    void load();
  }, [load]);

  async function sendTest(event: FormEvent) {
    event.preventDefault();
    setTestBusy(true);
    setTestNotice(null);
    const { ok, data } = await api<{ dryRun: boolean }>("/api/admin/send", { method: "POST", body: JSON.stringify({ mode: "test", to: testTo, subject, body }) });
    setTestBusy(false);
    setTestNotice(ok ? { tone: "success", text: data.dryRun ? "Dry run: RESEND_API_KEY isn't set, nothing was sent (see server logs)." : `Test sent to ${testTo}.` } : { tone: "danger", text: data.error ?? "Send failed." });
  }

  async function launch() {
    setConfirmOpen(false);
    setSending(true);
    setLaunchNotice(null);
    let total = 0;
    try {
      for (let i = 0; i < 1000; i++) {
        const { ok, data } = await api<{ sent: number; remaining: number; dryRun: boolean }>("/api/admin/send", { method: "POST", body: JSON.stringify({ mode: "launch", subject, body }) });
        if (!ok) throw new Error(data.error ?? "Send failed.");
        if (data.dryRun) {
          setLaunchNotice({ tone: "muted", text: `Dry run: would email ${data.sent} subscriber(s). Set RESEND_API_KEY and EMAIL_FROM to send for real.` });
          return;
        }
        total += data.sent;
        setProgress({ sent: total, remaining: data.remaining });
        if (data.remaining === 0 || data.sent === 0) break;
      }
      setLaunchNotice({ tone: "success", text: total === 0 ? "Everyone has already been emailed. Nothing to send." : `Launch email sent to ${total} subscriber(s).` });
    } catch (error) {
      setLaunchNotice({ tone: "danger", text: `${(error as Error).message} ${total ? `(${total} sent before the error; run again to continue, nobody gets it twice.)` : ""}` });
    } finally {
      setSending(false);
      void load();
    }
  }

  const { configured } = session;
  const pending = stats?.pending ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.05em]">Launch console</h1>
          <p className="mt-1 text-[13px] text-muted">Waitlist signups from solsjin.com and the one-time launch email.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11.5px]">
          <Pill ok={Boolean(configured.database)} label={configured.database ? "Database connected" : "DATABASE_URL missing"} />
          <Pill ok={Boolean(configured.email)} label={configured.email ? `Sending as ${configured.from}` : "Resend not configured (dry run)"} />
        </div>
      </div>

      {loadError && <p className="rounded-2xl border border-danger/40 bg-danger-soft px-4 py-3 text-[13px] text-danger">{loadError}</p>}

      <section aria-label="Stats" className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-4">
        {(
          [
            ["Subscribers", stats?.total],
            ["Waiting for launch email", stats?.pending],
            ["Emailed", stats?.notified],
            ["Unsubscribed", stats?.unsubscribed],
          ] as const
        ).map(([label, value]) => (
          <div className="bg-card px-5 py-4" key={label}>
            <p className="text-[12px] text-muted">{label}</p>
            <p className="mt-1 font-mono text-[26px] font-semibold tabular-nums tracking-[-.04em]">{value ?? "–"}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="compose-title" className="flex flex-col gap-4 rounded-[22px] border border-line bg-card p-5">
          <h2 className="text-[15px] font-semibold" id="compose-title">
            Launch email
          </h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mail-subject">Subject</Label>
            <Input id="mail-subject" maxLength={200} onChange={(e) => setSubject(e.target.value)} value={subject} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mail-body">Body</Label>
            <textarea
              className="min-h-[260px] w-full rounded-xl border border-line-strong bg-card px-3.5 py-3 text-[13.5px] leading-6 text-fg outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-4 focus:ring-ring/15"
              id="mail-body"
              onChange={(e) => setBody(e.target.value)}
              value={body}
            />
            <FieldHint>Plain text. Blank lines make paragraphs and links become clickable. An unsubscribe footer and an &ldquo;Open solsjin&rdquo; button are added automatically.</FieldHint>
          </div>

          <form className="flex flex-col gap-1.5 border-t border-line pt-4" onSubmit={sendTest}>
            <Label htmlFor="test-to">Send a test to yourself</Label>
            <div className="flex gap-2">
              <Input autoComplete="email" id="test-to" onChange={(e) => setTestTo(e.target.value)} placeholder="you@domain.com" type="email" value={testTo} />
              <Button className="shrink-0" disabled={!testTo} loading={testBusy} type="submit" variant="outline">
                <PaperPlaneTiltIcon size={15} /> Send test
              </Button>
            </div>
            {testNotice && (
              <FieldHint role="status" tone={testNotice.tone}>
                {testNotice.text}
              </FieldHint>
            )}
          </form>

          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <LiquidMetalButton disabled={sending || !stats || pending === 0 || !subject.trim() || !body.trim()} onClick={() => setConfirmOpen(true)} size="md">
                {sending ? <Spinner className="size-3.5" /> : <RocketLaunchIcon size={16} weight="bold" />}
                {sending ? "Sending" : `Send launch email${pending ? ` to ${pending}` : ""}`}
              </LiquidMetalButton>
              {progress && sending && (
                <span className="text-[12.5px] text-muted" role="status">
                  {progress.sent} sent, {progress.remaining} left
                </span>
              )}
            </div>
            {launchNotice && (
              <FieldHint className="text-[12.5px]" role="status" tone={launchNotice.tone}>
                {launchNotice.text}
              </FieldHint>
            )}
            <FieldHint>Only people who haven&apos;t been emailed yet get it, so running it again is safe.</FieldHint>
          </div>
        </section>

        <section aria-labelledby="list-title" className="flex min-w-0 flex-col rounded-[22px] border border-line bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="text-[15px] font-semibold" id="list-title">
              Subscribers
            </h2>
            <div className="flex gap-1.5">
              <Button aria-label="Refresh" onClick={() => void load()} size="icon-sm" variant="ghost">
                <ArrowClockwiseIcon size={15} />
              </Button>
              <a className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-line-strong bg-card px-3 text-xs font-medium text-fg transition-colors hover:bg-bg-subtle" download href="/api/admin/subscribers?format=csv">
                <DownloadSimpleIcon size={14} /> CSV
              </a>
            </div>
          </div>
          <div className="max-h-[560px] overflow-auto">
            {rows.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted">{stats ? "No signups yet." : "Loading…"}</p>
            ) : (
              <table className="w-full text-left text-[12.5px]">
                <thead className="sticky top-0 bg-card text-[11px] uppercase tracking-[.08em] text-faint">
                  <tr>
                    <th className="px-5 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Joined</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr className="border-t border-line" key={row.id}>
                      <td className="max-w-[220px] truncate px-5 py-2.5 font-medium" title={row.email}>
                        {row.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted">{fmt(row.created_at)}</td>
                      <td className="px-5 py-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            row.unsubscribed_at ? "bg-danger-soft text-danger" : row.notified_at ? "bg-accent-soft text-accent-fg" : "bg-bg-muted text-fg-soft",
                          )}
                        >
                          {row.unsubscribed_at ? "Unsubscribed" : row.notified_at ? "Emailed" : "Waiting"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {stats && stats.total > rows.length && <p className="border-t border-line px-5 py-3 text-[12px] text-muted">Showing the latest {rows.length}. Export CSV for everyone.</p>}
        </section>
      </div>

      <Dialog description={`This emails ${pending} subscriber(s) right now and can't be undone.`} onOpenChange={setConfirmOpen} open={confirmOpen} title="Send the launch email?">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-bg-subtle px-3.5 py-3 text-[13px]">
            <p className="text-muted">Subject</p>
            <p className="mt-0.5 font-medium">{subject}</p>
          </div>
          {!configured.email && <p className="text-[12.5px] text-muted">Resend isn&apos;t configured, so this will be a dry run.</p>}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={() => void launch()} variant="primary">
              <RocketLaunchIcon size={15} /> Yes, send to {pending}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", ok ? "border-line text-fg-soft" : "border-danger/40 text-danger")}>
      <span className={cn("size-1.5 rounded-full", ok ? "bg-accent" : "bg-danger")} />
      {label}
    </span>
  );
}
