-- Phase 18: Audit Logs
-- Run this after supabase/schema.sql if you want persistent production logs.

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  level text not null default 'info' check (level in ('info', 'warn', 'error')),
  message text not null,
  metadata jsonb default '{}'::jsonb,
  request_id text,
  created_at timestamptz default now()
);

create index if not exists audit_logs_user_id_idx on audit_logs(user_id);
create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id);
create index if not exists audit_logs_level_idx on audit_logs(level);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);

alter table audit_logs enable row level security;

create policy "Users can read own audit logs"
  on audit_logs for select
  using (auth.uid() = user_id);

create policy "Service role can insert audit logs"
  on audit_logs for insert
  with check (true);
