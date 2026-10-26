-- Waitlist for the solsjin.com coming-soon page.
-- Applied automatically on first use (lib/server/db.ts), or run it yourself:
--   psql "$DATABASE_URL" -f db/migrations/001_waitlist.sql
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
