-- NimbusDaily AI Phase 29: persistent server-side rate limit events.
-- Run this when USE_SUPABASE=true so serverless instances share limits.

create table if not exists rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz default now()
);

create index if not exists rate_limit_events_key_created_at_idx
  on rate_limit_events(key, created_at desc);

alter table rate_limit_events enable row level security;

-- Only backend service-role clients should write/read this table.
drop policy if exists "Service role can manage rate limit events" on rate_limit_events;
create policy "Service role can manage rate limit events"
  on rate_limit_events for all
  using (true)
  with check (true);
