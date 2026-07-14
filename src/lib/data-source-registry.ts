import type { DataSourceDefinition } from "@/types/data-freshness";

export const dataSourceRegistry = {
  newsData: {
    id: "newsdata-latest",
    name: "NewsData.io Latest",
    category: "news",
    priority: 90,
    enabled: Boolean(process.env.NEWSDATA_API_KEY),
    isNew: false,
    cacheTtlMs: 5 * 60_000,
    rateLimit: { requests: 30, windowMs: 15 * 60_000 },
  },
  googleNewsThailand: {
    id: "google-news-th-rss",
    name: "Google News Thailand RSS",
    category: "news",
    priority: 72,
    enabled: true,
    isNew: false,
    cacheTtlMs: 5 * 60_000,
    rateLimit: { requests: 40, windowMs: 5 * 60_000 },
  },
  googleNewsGlobal: {
    id: "google-news-global-rss",
    name: "Google News Global RSS",
    category: "global-news",
    priority: 78,
    enabled: true,
    isNew: true,
    cacheTtlMs: 5 * 60_000,
    rateLimit: { requests: 12, windowMs: 5 * 60_000 },
  },
  yahooQuote: {
    id: "yahoo-finance-quote",
    name: "Yahoo Finance Quote",
    category: "stocks",
    priority: 90,
    enabled: true,
    isNew: false,
    cacheTtlMs: 30_000,
    rateLimit: { requests: 8, windowMs: 60_000 },
  },
  yahooChart: {
    id: "yahoo-finance-chart",
    name: "Yahoo Finance Chart",
    category: "stocks",
    priority: 70,
    enabled: true,
    isNew: false,
    cacheTtlMs: 60_000,
    rateLimit: { requests: 48, windowMs: 60_000 },
  },
} satisfies Record<string, DataSourceDefinition>;

export function getDataSourceDefinition(id: string) {
  return Object.values(dataSourceRegistry).find((source) => source.id === id);
}
