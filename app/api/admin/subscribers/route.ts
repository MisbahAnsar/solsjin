import { isAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { errorResponse, json } from "@/lib/server/http";

type Row = { id: string; email: string; source: string | null; created_at: Date; notified_at: Date | null; unsubscribed_at: Date | null };

const csvCell = (value: unknown) => {
  const text = value instanceof Date ? value.toISOString() : value == null ? "" : String(value);
  // Quote everything and neutralise spreadsheet formulas.
  return `"${(/^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  if (!(await isAdmin())) return json({ ok: false, error: "Unauthorized" }, 401);
  const format = new URL(request.url).searchParams.get("format");
  try {
    const sql = await db();
    const [stats] = await sql<{ total: number; pending: number; notified: number; unsubscribed: number }[]>`
      select count(*)::int as total,
             count(*) filter (where notified_at is null and unsubscribed_at is null)::int as pending,
             count(*) filter (where notified_at is not null)::int as notified,
             count(*) filter (where unsubscribed_at is not null)::int as unsubscribed
      from waitlist`;
    if (format === "csv") {
      const rows = await sql<Row[]>`select id, email, source, created_at, notified_at, unsubscribed_at from waitlist order by id`;
      const csv = ["id,email,source,created_at,notified_at,unsubscribed_at", ...rows.map((r) => [r.id, r.email, r.source, r.created_at, r.notified_at, r.unsubscribed_at].map(csvCell).join(","))].join("\n");
      return new Response(csv, {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="solsjin-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
      });
    }
    const rows = await sql<Row[]>`select id, email, source, created_at, notified_at, unsubscribed_at from waitlist order by id desc limit 500`;
    return json({ ok: true, stats, rows });
  } catch (error) {
    return errorResponse(error, "admin/subscribers");
  }
}
