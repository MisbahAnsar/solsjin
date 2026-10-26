import { NextResponse } from "next/server";
import { NotConfiguredError } from "./db";

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function errorResponse(error: unknown, context: string) {
  if (error instanceof NotConfiguredError) {
    console.error(`[${context}] ${error.message}`);
    return json({ ok: false, code: "not_configured", error: "The waitlist isn't configured yet. Please try again later." }, 503);
  }
  console.error(`[${context}]`, error);
  return json({ ok: false, code: "server_error", error: "Something went wrong. Please try again." }, 500);
}
