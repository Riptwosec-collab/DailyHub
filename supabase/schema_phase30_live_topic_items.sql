create table if not exists public.live_topic_items (
  topic text not null check (topic in ('concerts', 'movies', 'events')),
  item_id text not null,
  payload jsonb not null,
  source_url text not null,
  refreshed_at timestamptz not null default now(),
  primary key (topic, item_id)
);

create index if not exists live_topic_items_topic_refreshed_idx
  on public.live_topic_items(topic, refreshed_at desc);

alter table public.live_topic_items enable row level security;
create policy "Public can read live topic items"
  on public.live_topic_items for select using (true);
