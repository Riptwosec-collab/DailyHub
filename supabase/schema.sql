-- NimbusDaily AI Phase 12-16 Supabase schema
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.scheduled_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  schedule_type text not null,
  cron_expression text,
  time text,
  timezone text not null default 'Asia/Bangkok',
  data_sources jsonb not null default '[]'::jsonb,
  gpt_actions jsonb not null default '[]'::jsonb,
  output_channels jsonb not null default '[]'::jsonb,
  min_priority_score int not null default 0 check (min_priority_score >= 0 and min_priority_score <= 100),
  status text not null default 'Active' check (status in ('Active', 'Paused', 'Failed', 'Running')),
  is_active boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.scheduled_tasks(id) on delete cascade,
  status text not null check (status in ('success', 'failed', 'running')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  raw_input jsonb not null default '{}'::jsonb,
  gpt_prompt text not null default '',
  gpt_output jsonb not null default '{}'::jsonb,
  priority_score int not null default 0 check (priority_score >= 0 and priority_score <= 100),
  telegram_status text not null default 'not_enabled',
  error_message text
);

create table if not exists public.web_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.scheduled_tasks(id) on delete cascade,
  task_run_id uuid references public.task_runs(id) on delete cascade,
  title text not null,
  summary text not null default '',
  type text not null,
  priority_score int not null default 0 check (priority_score >= 0 and priority_score <= 100),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_tasks_user_next_run_idx on public.scheduled_tasks(user_id, is_active, next_run_at);
create index if not exists scheduled_tasks_due_idx on public.scheduled_tasks(is_active, next_run_at) where is_active = true;
create index if not exists task_runs_task_started_idx on public.task_runs(task_id, started_at desc);
create index if not exists web_notifications_user_created_idx on public.web_notifications(user_id, created_at desc);

alter table public.scheduled_tasks enable row level security;
alter table public.task_runs enable row level security;
alter table public.web_notifications enable row level security;

drop policy if exists "Users can read own scheduled tasks" on public.scheduled_tasks;
create policy "Users can read own scheduled tasks"
on public.scheduled_tasks for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own scheduled tasks" on public.scheduled_tasks;
create policy "Users can insert own scheduled tasks"
on public.scheduled_tasks for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own scheduled tasks" on public.scheduled_tasks;
create policy "Users can update own scheduled tasks"
on public.scheduled_tasks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own scheduled tasks" on public.scheduled_tasks;
create policy "Users can delete own scheduled tasks"
on public.scheduled_tasks for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own task runs" on public.task_runs;
create policy "Users can read own task runs"
on public.task_runs for select
to authenticated
using (
  exists (
    select 1 from public.scheduled_tasks st
    where st.id = task_runs.task_id and st.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own notifications" on public.web_notifications;
create policy "Users can read own notifications"
on public.web_notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.web_notifications;
create policy "Users can update own notifications"
on public.web_notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
