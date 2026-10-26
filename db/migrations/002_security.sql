-- Durable rate limits (fixed windows, hashed keys) and the daily email counter used to stay inside
-- Resend's free quota. The app also creates these on first use (create if not exists).
create table if not exists rate_limits (
  key      text primary key,
  count    integer not null,
  reset_at timestamptz not null
);
create table if not exists email_quota (
  day  date primary key,
  sent integer not null default 0
);
