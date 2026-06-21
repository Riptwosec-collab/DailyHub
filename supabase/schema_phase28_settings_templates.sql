-- DailyHub AI Phase 28: Persist Settings + Task Templates in Supabase
-- Run this in Supabase Dashboard > SQL Editor after the Phase 12-16 schema.

create extension if not exists pgcrypto;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  open_ai_mode text not null default 'mock' check (open_ai_mode in ('mock', 'real')),
  telegram_mode text not null default 'off' check (telegram_mode in ('off', 'on')),
  scheduler_mode text not null default 'manual' check (scheduler_mode in ('manual', 'daily-cron', 'external')),
  default_timezone text not null default 'Asia/Bangkok',
  enable_web_notifications boolean not null default true,
  enable_news_data_source boolean not null default false,
  enable_weather_data_source boolean not null default false,
  enable_email_data_source boolean not null default false,
  min_default_priority_score int not null default 70 check (min_default_priority_score >= 0 and min_default_priority_score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_templates (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  type text not null,
  schedule_type text not null,
  cron_expression text,
  time text,
  timezone text not null default 'Asia/Bangkok',
  data_sources jsonb not null default '[]'::jsonb,
  gpt_actions jsonb not null default '[]'::jsonb,
  output_channels jsonb not null default '[]'::jsonb,
  min_priority_score int not null default 70 check (min_priority_score >= 0 and min_priority_score <= 100),
  tags jsonb not null default '[]'::jsonb,
  icon text not null default '🤖',
  recommended_for text not null default '',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_settings_updated_idx on public.user_settings(updated_at desc);
create index if not exists task_templates_user_idx on public.task_templates(user_id, is_system, created_at);
create index if not exists task_templates_system_idx on public.task_templates(is_system) where is_system = true;

alter table public.user_settings enable row level security;
alter table public.task_templates enable row level security;

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read system and own templates" on public.task_templates;
create policy "Users can read system and own templates"
on public.task_templates for select
to authenticated
using (is_system = true or auth.uid() = user_id);

drop policy if exists "Users can insert own templates" on public.task_templates;
create policy "Users can insert own templates"
on public.task_templates for insert
to authenticated
with check (auth.uid() = user_id and is_system = false);

drop policy if exists "Users can update own templates" on public.task_templates;
create policy "Users can update own templates"
on public.task_templates for update
to authenticated
using (auth.uid() = user_id and is_system = false)
with check (auth.uid() = user_id and is_system = false);

drop policy if exists "Users can delete own templates" on public.task_templates;
create policy "Users can delete own templates"
on public.task_templates for delete
to authenticated
using (auth.uid() = user_id and is_system = false);

insert into public.task_templates (
  id,
  user_id,
  name,
  description,
  type,
  schedule_type,
  cron_expression,
  time,
  timezone,
  data_sources,
  gpt_actions,
  output_channels,
  min_priority_score,
  tags,
  icon,
  recommended_for,
  is_system
)
values
  (
    'morning-daily-brief',
    null,
    'Morning Daily Brief',
    'สรุปข่าว เทคโนโลยี และสภาพอากาศทุกเช้า พร้อม action ที่ควรทำต่อ',
    'Daily Brief',
    'Daily',
    '0 8 * * *',
    '08:00',
    'Asia/Bangkok',
    '["News", "Weather API"]'::jsonb,
    '["Summarize", "Analyze Priority", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications", "Send Telegram"]'::jsonb,
    70,
    '["Morning", "News", "Weather"]'::jsonb,
    '☀️',
    'คนที่อยากได้สรุปรายวันก่อนเริ่มงาน',
    true
  ),
  (
    'important-email-monitor',
    null,
    'Important Email Monitor',
    'คัดอีเมลสำคัญ วิเคราะห์ความเร่งด่วน และแจ้งเตือนเฉพาะรายการที่ต้องตอบ',
    'Email Monitor',
    'Hourly',
    '0 * * * *',
    null,
    'Asia/Bangkok',
    '["Gmail"]'::jsonb,
    '["Summarize", "Analyze Priority", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications", "Send Telegram"]'::jsonb,
    80,
    '["Email", "Priority", "Work"]'::jsonb,
    '✉️',
    'คนที่ต้องติดตามอีเมลงานสำคัญ',
    true
  ),
  (
    'sale-monitor',
    null,
    'Sale Monitor',
    'ติดตามสินค้าและโปรโมชันที่สนใจ แล้วให้ GPT สรุปว่าโปรคุ้มหรือควรรอ',
    'Sale Monitor',
    'Daily',
    '0 9 * * *',
    '09:00',
    'Asia/Bangkok',
    '["Product Prices"]'::jsonb,
    '["Summarize", "Analyze Priority", "Generate Caption", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications"]'::jsonb,
    65,
    '["Sale", "Affiliate", "Shopping"]'::jsonb,
    '🛒',
    'สาย Affiliate หรือคนติดตามโปรลดราคา',
    true
  ),
  (
    'weather-morning-update',
    null,
    'Weather Morning Update',
    'สรุปสภาพอากาศตอนเช้า พร้อมคำแนะนำการเดินทางและกิจกรรมประจำวัน',
    'Daily Brief',
    'Daily',
    '30 6 * * *',
    '06:30',
    'Asia/Bangkok',
    '["Weather API"]'::jsonb,
    '["Summarize", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications", "Send Telegram"]'::jsonb,
    50,
    '["Weather", "Morning", "Travel"]'::jsonb,
    '🌦️',
    'คนที่อยากวางแผนเดินทางทุกเช้า',
    true
  ),
  (
    'football-recap',
    null,
    'Football Daily Recap',
    'สรุปผลบอล ตารางแข่ง และเรื่องเด่นของทีมที่ติดตาม',
    'World Cup Recap',
    'Daily',
    '0 7 * * *',
    '07:00',
    'Asia/Bangkok',
    '["Football API"]'::jsonb,
    '["Summarize", "Generate Caption"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications"]'::jsonb,
    60,
    '["Football", "Sport", "Recap"]'::jsonb,
    '⚽',
    'คนที่อยากได้สรุปฟุตบอลแบบอ่านเร็ว',
    true
  ),
  (
    'weekend-ideas',
    null,
    'Weekend Ideas Generator',
    'สร้างไอเดียเที่ยว อ่าน ดูหนัง หรือกิจกรรมสุดสัปดาห์จากความสนใจของผู้ใช้',
    'Weekend Ideas',
    'Weekly',
    '0 19 * * 5',
    '19:00',
    'Asia/Bangkok',
    '["News", "Weather API"]'::jsonb,
    '["Summarize", "Generate Caption", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications"]'::jsonb,
    55,
    '["Weekend", "Lifestyle", "Ideas"]'::jsonb,
    '✨',
    'คนที่อยากได้ไอเดียทำกิจกรรมช่วงวันหยุด',
    true
  ),
  (
    'concert-alerts',
    null,
    'Concert Alerts',
    'แจ้งเตือนข่าวคอนเสิร์ตและอีเวนต์ที่เกี่ยวกับศิลปินหรือแนวเพลงที่สนใจ',
    'Concert Alerts',
    'Daily',
    '0 18 * * *',
    '18:00',
    'Asia/Bangkok',
    '["Concert API", "News"]'::jsonb,
    '["Summarize", "Analyze Priority", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications", "Send Telegram"]'::jsonb,
    75,
    '["Concert", "Event", "Alert"]'::jsonb,
    '🎫',
    'คนที่ไม่อยากพลาดประกาศคอนเสิร์ต',
    true
  ),
  (
    'custom-ai-task',
    null,
    'Custom AI Task',
    'Template เปล่าสำหรับงาน AI ที่อยากตั้งเอง เช่น สรุปเว็บ ข่าวเฉพาะเรื่อง หรือ reminder แบบกำหนดเอง',
    'Custom',
    'Daily',
    '0 8 * * *',
    '08:00',
    'Asia/Bangkok',
    '["News"]'::jsonb,
    '["Summarize", "Recommend Action"]'::jsonb,
    '["Save to Web Dashboard", "Save to Notifications"]'::jsonb,
    70,
    '["Custom", "AI", "Starter"]'::jsonb,
    '🤖',
    'ใช้เป็นจุดเริ่มต้นสำหรับ workflow ของตัวเอง',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  schedule_type = excluded.schedule_type,
  cron_expression = excluded.cron_expression,
  time = excluded.time,
  timezone = excluded.timezone,
  data_sources = excluded.data_sources,
  gpt_actions = excluded.gpt_actions,
  output_channels = excluded.output_channels,
  min_priority_score = excluded.min_priority_score,
  tags = excluded.tags,
  icon = excluded.icon,
  recommended_for = excluded.recommended_for,
  is_system = true,
  updated_at = now();
