import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const SCHEMA = `
create table if not exists waitlist (
  id              bigserial primary key,
  email           text not null,
  source          text,
  created_at      timestamptz not null default now(),
  notified_at     timestamptz,
  unsubscribed_at timestamptz,
  constraint waitlist_email_lowercase check (email = lower(email))
);
create unique index if not exists waitlist_email_key on waitlist (email);
create index if not exists waitlist_pending_idx on waitlist (id) where notified_at is null and unsubscribed_at is null;
create table if not exists rate_limits (
  key      text primary key,
  count    integer not null,
  reset_at timestamptz not null
);
create table if not exists email_quota (
  day  date primary key,
  sent integer not null default 0
);
`;

export class NotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} is not configured`);
    this.name = "NotConfiguredError";
  }
}

const globalForDb = globalThis as unknown as { __solsjinSql?: Sql; __solsjinSchema?: Promise<void> };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * One small pool per serverless instance. Works with Neon, Supabase (pooler or direct) and any
 * Postgres. `prepare: false` keeps it compatible with transaction-mode poolers (pgbouncer/Supavisor).
 */
function client(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new NotConfiguredError("DATABASE_URL");
  if (!globalForDb.__solsjinSql) {
    const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
    globalForDb.__solsjinSql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: local || /sslmode=disable/.test(url) ? false : "require",
      onnotice: () => {},
    });
  }
  return globalForDb.__solsjinSql;
}

/** Returns a ready client, creating the table on first use (safe to run repeatedly). */
export async function db(): Promise<Sql> {
  const sql = client();
  globalForDb.__solsjinSchema ??= sql.unsafe(SCHEMA).then(
    () => undefined,
    (error) => {
      globalForDb.__solsjinSchema = undefined;
      throw error;
    },
  );
  await globalForDb.__solsjinSchema;
  return sql;
}
