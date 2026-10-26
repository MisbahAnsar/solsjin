import { verifyUnsubscribeToken } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { SITE_URL } from "@/lib/site-url";

async function unsubscribe(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";
  if (!email || !verifyUnsubscribeToken(email, token)) return { status: 400, message: "This unsubscribe link is invalid or has expired." };
  try {
    const sql = await db();
    await sql`update waitlist set unsubscribed_at = coalesce(unsubscribed_at, now()) where email = ${email}`;
    return { status: 200, message: "You're unsubscribed. You won't get any more emails from solsjin." };
  } catch (error) {
    console.error("[unsubscribe]", error);
    return { status: 500, message: "Something went wrong. Please try again later." };
  }
}

function page(message: string, status: number) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>solsjin</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif">
<main style="max-width:420px;padding:24px;text-align:center"><p style="font-size:15px;line-height:24px">${message}</p><a href="${SITE_URL}" style="color:#0a0a0a;font-weight:600">solsjin.com</a></main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const result = await unsubscribe(request);
  return page(result.message, result.status);
}

/** RFC 8058 one-click unsubscribe (List-Unsubscribe-Post). */
export async function POST(request: Request) {
  const result = await unsubscribe(request);
  return new Response(null, { status: result.status === 200 ? 200 : result.status });
}
