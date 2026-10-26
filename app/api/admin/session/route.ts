import { isAdmin, isAdminConfigured } from "@/lib/server/auth";
import { isDatabaseConfigured } from "@/lib/server/db";
import { isEmailConfigured } from "@/lib/server/email";
import { json } from "@/lib/server/http";

export async function GET() {
  const authed = await isAdmin();
  return json({
    authed,
    configured: {
      admin: isAdminConfigured(),
      ...(authed ? { database: isDatabaseConfigured(), email: isEmailConfigured(), from: process.env.EMAIL_FROM ?? null } : {}),
    },
  });
}
