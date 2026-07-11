import { NextResponse } from "next/server";
import { summarizeTopicCatalog, topicRefreshCatalog } from "@/data/topic-refresh-catalog";
import { isScheduledItemActive } from "@/lib/event-date";
import { readLiveTopicItems, saveLiveTopicItems } from "@/lib/live-topic-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TopicKey = "concerts" | "movies" | "events";

type TopicSource = {
  name: string;
  url: string;
};

const topicSources: Record<TopicKey, TopicSource[]> = {
  concerts: [
    { name: "ThaiTicketMajor Concert", url: "https://www.thaiticketmajor.com/concert/" },
    { name: "The Street Ratchada Events", url: "https://www.thestreetratchada.com/event" },
    { name: "Eventpop Music", url: "https://www.eventpop.me/" },
  ],
  movies: [
    { name: "Major Cineplex Movies", url: "https://www.majorcineplex.com/movie" },
    { name: "Netflix Tudum", url: "https://www.netflix.com/tudum" },
    { name: "Netflix Newsroom", url: "https://about.netflix.com/en/news" },
  ],
  events: [
    { name: "QSNCC Event Calendar", url: "https://www.qsncc.com/en/whats-on/event-calendar/" },
    { name: "IMPACT Event Calendar", url: "https://www.impact.co.th/index.php/visitor/event/en" },
    { name: "Eventpop Events", url: "https://www.eventpop.me/" },
  ],
};

type SourceResult = {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  title?: string;
  error?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") as TopicKey | null;
  const shouldRefresh = searchParams.has("refresh");

  if (!topic || !(topic in topicSources)) {
    return NextResponse.json({ success: false, error: "Unsupported topic", checked: 0, reachable: 0, sources: [] }, { status: 400 });
  }

  const sources = topicSources[topic];
  const storedItems = shouldRefresh ? [] : await readLiveTopicItems(topic);
  const results = shouldRefresh ? await Promise.all(sources.map(checkSource)) : [];
  const reachable = results.filter((result) => result.ok).length;
  const catalog = topicRefreshCatalog[topic];
  const sourceItems = storedItems.length ? storedItems : catalog.items;
  const activeItems = sourceItems.filter((item) => isScheduledItemActive(item.dateEn));
  const expiredCount = sourceItems.length - activeItems.length;
  const summary = summarizeTopicCatalog(topic, activeItems);
  const storage = shouldRefresh ? await saveLiveTopicItems(topic, activeItems) : storedItems.length ? "supabase" : "catalog";
  const success = !shouldRefresh || reachable > 0 || summary.totalItems > 0;

  return NextResponse.json(
    {
      success,
      topic,
      updatedAt: new Date().toISOString(),
      checked: sources.length,
      reachable,
      labelTh: catalog.labelTh,
      labelEn: catalog.labelEn,
      noteTh: catalog.noteTh,
      noteEn: catalog.noteEn,
      summary,
      items: activeItems,
      expiredCount,
      storage,
      sources: results,
      error: success ? undefined : "No live source responded and no catalog items available",
    },
    { status: success ? 200 : 502 },
  );
}

async function checkSource(source: TopicSource): Promise<SourceResult> {
  try {
    const response = await fetch(source.url, {
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent": "Mozilla/5.0 NimbusDaily/1.0 topic refresh",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return { ...source, ok: false, status: response.status, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    return {
      ...source,
      ok: true,
      status: response.status,
      title: extractTitle(html),
    };
  } catch (error) {
    return { ...source, ok: false, error: error instanceof Error ? error.message : "request failed" };
  }
}

function extractTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (!title) return undefined;
  return title.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 140);
}
