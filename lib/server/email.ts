import { SITE_URL } from "@/lib/site-url";
import { unsubscribeToken } from "./auth";

export { DEFAULT_BODY, DEFAULT_SUBJECT } from "@/lib/launch-copy";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function linkify(escaped: string) {
  return escaped.replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (url) => `<a href="${url}" style="color:#0a0a0a;font-weight:600;text-decoration:underline">${url}</a>`);
}

export function unsubscribeUrl(email: string) {
  return `${SITE_URL}/api/waitlist/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

/** Plain-text body (paragraphs separated by blank lines) rendered to a simple, client-safe HTML email. */
export function renderLaunchEmail({ body, email }: { body: string; email: string }) {
  const unsub = unsubscribeUrl(email);
  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#2a2a2a">${linkify(escapeHtml(p)).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f6f4;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e8e8e4;border-radius:24px">
<tr><td style="padding:32px 32px 8px"><div style="font-size:28px;font-weight:800;letter-spacing:.02em;color:#000">SOLSJIN</div></td></tr>
<tr><td style="padding:16px 32px 8px">${paragraphs}</td></tr>
<tr><td style="padding:0 32px 32px"><a href="${SITE_URL}" style="display:inline-block;background:#0a0a0a;color:#ffffff;border-radius:999px;padding:12px 22px;font-size:14px;font-weight:600;text-decoration:none">Open solsjin</a></td></tr>
</table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:18px;color:#8a8a85">You're getting this one-time email because you asked to be notified about solsjin at ${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}.<br><a href="${unsub}" style="color:#8a8a85">Unsubscribe</a></p>
</td></tr></table></body></html>`;
  const text = `${body.trim()}\n\n--\nYou're getting this one-time email because you asked to be notified about solsjin.\nUnsubscribe: ${unsub}\n`;
  return { html, text, unsub };
}

export type OutgoingEmail = { to: string; subject: string; body: string };

/**
 * Sends up to 100 emails in one Resend batch call. Without RESEND_API_KEY it runs in dry-run mode
 * (logs, sends nothing) so the flow can be tested end to end.
 */
export async function sendBatch(emails: OutgoingEmail[], idempotencyKey?: string): Promise<{ dryRun: boolean }> {
  if (emails.length === 0) return { dryRun: !process.env.RESEND_API_KEY };
  if (emails.length > 100) throw new Error("Resend batches are limited to 100 emails");
  const from = process.env.EMAIL_FROM;
  const key = process.env.RESEND_API_KEY;
  const payload = emails.map(({ to, subject, body }) => {
    const { html, text, unsub } = renderLaunchEmail({ body, email: to });
    return {
      from: from || "solsjin <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
      headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
      tags: [{ name: "campaign", value: "launch" }],
    };
  });
  if (!key) {
    console.info(`[email] dry run: would send ${payload.length} email(s): ${emails.map((e) => e.to).join(", ")}`);
    return { dryRun: true };
  }
  if (!from) throw new Error("EMAIL_FROM is not set");
  const res = await fetch(`${process.env.RESEND_API_URL || "https://api.resend.com"}/emails/batch`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  return { dryRun: false };
}
