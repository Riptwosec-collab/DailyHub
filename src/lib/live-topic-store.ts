import { createAdminClient } from "@/lib/supabase/admin";
import type { TopicRefreshCatalog, TopicRefreshItem } from "@/data/topic-refresh-catalog";

type Topic = TopicRefreshCatalog["topic"];
type StoredTopicItems = Record<Topic, TopicRefreshItem[]>;

declare global {
  var nimbusDailyLiveTopics: Partial<StoredTopicItems> | undefined;
}

export async function readLiveTopicItems(topic: Topic) {
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin.from("live_topic_items").select("payload").eq("topic", topic).order("refreshed_at", { ascending: false });
    if (data?.length) return data.map((row) => row.payload as TopicRefreshItem);
  }
  return globalThis.nimbusDailyLiveTopics?.[topic] ?? [];
}

export async function saveLiveTopicItems(topic: Topic, items: TopicRefreshItem[]) {
  globalThis.nimbusDailyLiveTopics = { ...globalThis.nimbusDailyLiveTopics, [topic]: items };
  const admin = createAdminClient();
  if (!admin) return "memory" as const;

  await admin.from("live_topic_items").upsert(
    items.map((item) => ({ topic, item_id: item.id, payload: item, source_url: item.sourceUrl, refreshed_at: new Date().toISOString() })),
    { onConflict: "topic,item_id" },
  );
  return "supabase" as const;
}
