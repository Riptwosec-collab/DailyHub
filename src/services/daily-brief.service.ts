import { dailyBriefCategories, defaultDailyBriefSettings, mockDailyBriefItems, mockDailyBriefLogs } from "@/data/daily-brief.mock";
import { dataSourceRegistry } from "@/lib/data-source-registry";
import { rankGlobalTopStories } from "@/services/global-news-ranking.service";
import { processDailyBriefItems } from "@/services/news-processing.service";
import { summarizeDailyBriefItems, summarizeSingleNews } from "@/services/news-summary.service";
import { fetchNewsDataLatest } from "@/services/newsdata.service";
import type { DailyBriefApiResponse, DailyBriefCategoryKey, DailyBriefItem, DailyBriefProcessingReport, DailyBriefRunLog } from "@/types/daily-brief";

type DailyBriefCache = {
  items: DailyBriefItem[];
  fetchedAt: string;
  expiresAt: number;
  message: string;
  mode: "mock" | "real" | "fallback";
  partialFailures: string[];
};

declare global {
  var nimbusDailyBriefCache: DailyBriefCache | undefined;
}

const NEWS_CACHE_TTL_MS = dataSourceRegistry.googleNewsThailand.cacheTtlMs;

function parseCategory(value: string | null): DailyBriefCategoryKey | undefined {
  if (!value || value === "all") return undefined;
  const found = dailyBriefCategories.find((category) => category.key === value);
  return found?.key === "all" ? undefined : found?.key;
}

function filterItems(items: DailyBriefItem[], category?: DailyBriefCategoryKey, search?: string | null) {
  const query = (search || "").trim().toLowerCase();
  return items.filter((item) => {
    if (item.category === "lifestyle") return false;
    const matchesCategory = !category || item.category === category;
    const matchesSearch = !query || [item.title, item.titleTh, item.summaryTh, item.sourceName, item.tags.join(" ")].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesSearch && !item.isHidden;
  });
}

export async function getLatestDailyBrief(params?: { category?: string | null; search?: string | null; forceRefresh?: boolean }): Promise<DailyBriefApiResponse> {
  const category = parseCategory(params?.category || null);
  let items: DailyBriefItem[] = [];
  let mode: "mock" | "real" | "fallback" = "real";
  let message = "Using real Daily Brief feeds";
  const useRealNews = process.env.USE_REAL_NEWS !== "false";
  const now = new Date();
  let fetchedAt = now.toISOString();
  let cacheStatus: DailyBriefProcessingReport["cacheStatus"] = "miss";
  let partialFailures: string[] = [];
  const cached = globalThis.nimbusDailyBriefCache;

  if (useRealNews && cached && !params?.forceRefresh && cached.expiresAt > now.getTime()) {
    items = cached.items;
    mode = cached.mode;
    message = cached.message;
    fetchedAt = cached.fetchedAt;
    partialFailures = cached.partialFailures;
    cacheStatus = "hit";
  } else if (useRealNews) {
    try {
      const result = await fetchNewsDataLatest();
      if (result.items.length > 0) {
        items = result.items;
        mode = "real";
      }
      message = result.message;
      partialFailures = result.partialFailures ?? [];
      fetchedAt = new Date().toISOString();
      globalThis.nimbusDailyBriefCache = {
        items,
        fetchedAt,
        expiresAt: Date.now() + NEWS_CACHE_TTL_MS,
        message,
        mode,
        partialFailures,
      };
    } catch (error) {
      if (cached?.items.length) {
        items = cached.items;
        fetchedAt = cached.fetchedAt;
        mode = "fallback";
        cacheStatus = "stale-fallback";
        partialFailures = [...cached.partialFailures, "live-refresh"];
        message = `${cached.message}; live refresh failed`;
      } else {
        mode = "fallback";
        partialFailures = ["all-news-sources"];
        message = error instanceof Error ? error.message : "News provider fallback activated";
      }
    }
  }

  if (!items.length && !useRealNews) {
    items = mockDailyBriefItems;
    mode = "mock";
    message = "USE_REAL_NEWS=false; using mock data";
  } else if (!items.length) {
    mode = "fallback";
    message = `${message}; real feeds returned no usable news`;
  }

  const processed = processDailyBriefItems(items.map(summarizeSingleNews), { now, fetchedAt, cacheStatus, partialFailures });
  if (globalThis.nimbusDailyBriefCache) globalThis.nimbusDailyBriefCache.items = processed.items;
  const prepared = filterItems(processed.items, category, params?.search);
  const summary = summarizeDailyBriefItems(prepared, mode);
  summary.globalTopStories = rankGlobalTopStories(processed.items, 6, now);
  const latestPublishedAt = processed.items
    .map((item) => item.publishedAt)
    .filter((value) => Number.isFinite(new Date(value).getTime()))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  const logs: DailyBriefRunLog[] = [
    { id: `brief_log_${processed.report.processedAt}`, runAt: processed.report.processedAt, status: partialFailures.length ? "skipped" : "success", fetchedItems: items.length, summarizedItems: prepared.length, telegramParts: 0, message },
    ...(mode === "mock" ? mockDailyBriefLogs : []),
  ];

  return {
    items: prepared,
    summary,
    categories: dailyBriefCategories,
    settings: {
      ...defaultDailyBriefSettings,
      useRealNews,
      newsProvider: process.env.NEWSDATA_API_KEY && useRealNews ? "hybrid" : "googleNewsRss",
      autoSendTelegram: process.env.DAILY_BRIEF_AUTO_SEND === "true",
      telegramTime: process.env.DAILY_BRIEF_TIME || defaultDailyBriefSettings.telegramTime,
    },
    logs,
    freshness: {
      sourcePublishedAt: latestPublishedAt,
      fetchedAt,
      processedAt: processed.report.processedAt,
    },
    processingReport: processed.report,
  };
}

export async function summarizeDailyBriefPayload(items?: DailyBriefItem[]) {
  const data = items?.length ? items.map(summarizeSingleNews) : (await getLatestDailyBrief()).items;
  return summarizeDailyBriefItems(processDailyBriefItems(data).items, items?.length ? "fallback" : "mock");
}

export function getDailyBriefSchedulerPreview() {
  const time = process.env.DAILY_BRIEF_TIME || "08:00";
  const [hour = "08", minute = "00"] = time.split(":");
  const nextRun = new Date();
  nextRun.setHours(Number(hour), Number(minute), 0, 0);
  if (nextRun.getTime() <= Date.now()) nextRun.setDate(nextRun.getDate() + 1);
  return {
    enabled: process.env.DAILY_BRIEF_AUTO_SEND === "true",
    time,
    timezone: "Asia/Bangkok",
    categories: defaultDailyBriefSettings.enabledCategories,
    maxItemsPerCategory: defaultDailyBriefSettings.maxItemsPerCategory,
    lastSent: mockDailyBriefLogs[0]?.runAt || null,
    nextRun: nextRun.toISOString(),
    status: process.env.DAILY_BRIEF_AUTO_SEND === "true" ? "scheduled" : "disabled",
  };
}
