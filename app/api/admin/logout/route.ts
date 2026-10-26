import { cookies } from "next/headers";
import { ADMIN_COOKIE, sameOrigin } from "@/lib/server/auth";
import { json } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden" }, 403);
  (await cookies()).delete(ADMIN_COOKIE);
  return json({ ok: true });
}
