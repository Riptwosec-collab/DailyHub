import { NextResponse } from "next/server";
import { stockSearchCatalog } from "@/data/stock-search-catalog";
import { topicRefreshCatalog, type TopicRefreshItem } from "@/data/topic-refresh-catalog";
import { isScheduledItemActive } from "@/lib/event-date";
import { readLiveTopicItems } from "@/lib/live-topic-store";
import { detectSearchIntent } from "@/lib/search/search-intent";
import { rankSearchDocuments } from "@/lib/search/search-ranking";
import { getLatestDailyBrief } from "@/services/daily-brief.service";
import type { SearchApiResponse, SearchCategory, SearchDocument } from "@/types/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const topicMeta = {
  concerts: { category: "concerts", code: "CN", route: "/concerts" },
  movies: { category: "movies", code: "MV", route: "/movies" },
  events: { category: "events", code: "EV", route: "/events" },
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const requestedCategory = parseCategory(url.searchParams.get("category"));
  const baseIntent = detectSearchIntent(query);
  const tickerIntent = stockSearchCatalog.find((stock) => baseIntent.tokens.includes(stock.symbol.toLocaleLowerCase("en-US")));
  const detectedIntent = tickerIntent ? { ...baseIntent, category: "stocks" as const } : baseIntent;
  const intent = requestedCategory === "all" ? detectedIntent : { ...detectedIntent, category: requestedCategory };

  if (query.length < 2) {
    return NextResponse.json({ success: true, query, intent, results: [], total: 0, partialFailures: [] } satisfies SearchApiResponse);
  }

  const documents: SearchDocument[] = [];
  const partialFailures: string[] = [];
  const categories = intent.category === "all" ? ["daily", "stocks", "concerts", "movies", "events"] : [intent.category];

  if (categories.includes("stocks")) {
    const stocks = tickerIntent ? stockSearchCatalog.filter((stock) => stock.symbol === tickerIntent.symbol) : stockSearchCatalog;
    documents.push(...buildStockDocuments(stocks));
  }

  const jobs: Array<Promise<void>> = [];
  if (categories.includes("daily")) {
    jobs.push(
      getLatestDailyBrief()
        .then((payload) => {
          documents.push(...payload.items.map((item) => ({
            id: `daily:${item.id}`,
            category: "daily" as const,
            code: "DY" as const,
            title: item.titleTh || item.title,
            subtitle: item.sourceName,
            description: item.summaryTh || item.rawDescription,
            tags: item.tags,
            keywords: [item.title, item.category, item.sourceName],
            href: `/daily?search=${encodeURIComponent(item.titleTh || item.title)}`,
            sourceLabel: item.sourceName,
            publishedAt: item.publishedAt,
            active: !item.isHidden,
          })));
        })
        .catch(() => {
          partialFailures.push("daily");
        }),
    );
  }

  for (const topic of ["concerts", "movies", "events"] as const) {
    if (!categories.includes(topic)) continue;
    jobs.push(
      getTopicItems(topic)
        .then((items) => {
          documents.push(...buildTopicDocuments(topic, items));
        })
        .catch(() => {
          partialFailures.push(topic);
        }),
    );
  }

  await Promise.all(jobs);
  const results = rankSearchDocuments(documents, query, intent);
  return NextResponse.json({ success: true, query, intent, results, total: results.length, partialFailures } satisfies SearchApiResponse);
}

function parseCategory(value: string | null): SearchCategory {
  return ["daily", "stocks", "concerts", "movies", "events"].includes(value ?? "") ? value as SearchCategory : "all";
}

function buildStockDocuments(stocks = stockSearchCatalog): SearchDocument[] {
  return stocks.map((stock) => ({
    id: `stock:${stock.symbol}`,
    category: "stocks",
    code: "ST",
    title: `${stock.symbol} · ${stock.name}`,
    subtitle: stock.category,
    description: `ข้อมูลหุ้น ${stock.name} ในหมวด ${stock.category}`,
    tags: stock.tags,
    keywords: [stock.symbol, stock.name, stock.category, "หุ้น", "stock", "ticker"],
    href: `/stocks?search=${encodeURIComponent(stock.symbol)}#overview`,
    active: true,
  }));
}

async function getTopicItems(topic: keyof typeof topicMeta) {
  const stored = await readLiveTopicItems(topic);
  const items = stored.length ? stored : topicRefreshCatalog[topic].items;
  return items.filter((item) => isScheduledItemActive(item.dateEn));
}

function buildTopicDocuments(topic: keyof typeof topicMeta, items: TopicRefreshItem[]): SearchDocument[] {
  const meta = topicMeta[topic];
  return items.map((item) => ({
    id: `${topic}:${item.id}`,
    category: meta.category,
    code: meta.code,
    title: item.title,
    subtitle: `${item.dateTh} · ${item.detailTh}`,
    description: `${item.detailTh} จาก ${item.sourceLabel}`,
    tags: [item.group, item.sourceLabel],
    keywords: [item.dateTh, item.dateEn, item.detailEn, topicRefreshCatalog[topic].labelTh, topicRefreshCatalog[topic].labelEn],
    href: `${meta.route}?search=${encodeURIComponent(item.title)}`,
    sourceLabel: item.sourceLabel,
    eventDate: parseEventDate(item.dateEn),
    active: true,
  }));
}

function parseEventDate(label: string) {
  const dateMatch = label.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i);
  const year = label.match(/\b(20\d{2})\b/)?.[1];
  if (!dateMatch || !year) return undefined;
  const parsed = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${year} 12:00:00 GMT+0700`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
