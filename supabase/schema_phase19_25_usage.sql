-- DailyHub AI Phase 19-25 optional production usage tables

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null,
  amount int not null default 1,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists usage_events_user_id_idx on usage_events(user_id);
create index if not exists usage_events_type_idx on usage_events(type);
create index if not exists usage_events_created_at_idx on usage_events(created_at desc);

alter table usage_events enable row level security;

drop policy if exists "Users can read own usage events" on usage_events;
create policy "Users can read own usage events" on usage_events
  for select using (auth.uid() = user_id);

-- For service role/admin API only, insert from backend using SUPABASE_SECRET_KEY.
