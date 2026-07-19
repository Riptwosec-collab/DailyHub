import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  postMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  marketCap?: number;
  regularMarketVolume?: number;
  marketState?: string;
  regularMarketTime?: number;
  shortName?: string;
};

type YahooResponse = {
  quoteResponse?: {
    result?: YahooQuote[];
  };
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketPreviousClose?: number;
        previousClose?: number;
        regularMarketVolume?: number;
        marketCap?: number;
        regularMarketTime?: number;
        shortName?: string;
        longName?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type NormalizedQuote = {
  symbol?: string;
  price: number;
  prevClose: number;
  afterHours: number;
  change: number;
  changePercent: number;
  afterChange: number;
  afterChangePercent: number;
  marketCap: string;
  volume: string;
  marketState?: string;
  updatedAt?: string;
  name?: string;
};

type QuotePayload = {
  success: boolean;
  fallback?: boolean;
  source: string;
  sourceId: string;
  delayed: boolean;
  updatedAt?: string;
  fetchedAt: string;
  quotes: NormalizedQuote[];
  error?: string;
};

const QUOTE_CACHE_TTL_MS = 30_000;
const quoteCache = new Map<string, { expiresAt: number; payload: QuotePayload }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 80);

  if (symbols.length === 0) {
    return NextResponse.json({ success: false, error: "No symbols provided", quotes: [] }, { status: 400 });
  }

  const cacheKey = symbols.slice().sort().join(",");
  const forceRefresh = searchParams.has("refresh");
  const cached = quoteCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ ...cached.payload, cacheStatus: "hit" });
  }

  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        "user-agent": "NimbusDaily/1.0 quote dashboard",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo quote failed: ${response.status}`);
    }

    const payload = (await response.json()) as YahooResponse;
    const quotes = (payload.quoteResponse?.result ?? [])
      .filter((item) => item.symbol && typeof item.regularMarketPrice === "number")
      .map(normalizeQuoteResult);

    if (quotes.length === 0) {
      throw new Error("Yahoo quote endpoint returned no quotes");
    }

    const fetchedAt = new Date().toISOString();
    const quotePayload = {
      success: true,
      source: "Yahoo Finance quote endpoint",
      sourceId: "yahoo-finance-quote",
      delayed: true,
      updatedAt: latestQuoteTimestamp(quotes),
      fetchedAt,
      quotes,
    } satisfies QuotePayload;
    quoteCache.set(cacheKey, { expiresAt: Date.now() + QUOTE_CACHE_TTL_MS, payload: quotePayload });
    return NextResponse.json({ ...quotePayload, cacheStatus: "miss" });
  } catch (quoteError) {
    const chartQuotes = await mapWithConcurrency(symbols, 8, fetchChartQuote);
    const quotes = chartQuotes.filter((item): item is NormalizedQuote => Boolean(item));
    const fetchedAt = new Date().toISOString();
    const quotePayload = {
      success: quotes.length > 0,
      fallback: quotes.length === 0,
      source: quotes.length > 0 ? "Yahoo Finance chart endpoint" : "local sample fallback required",
      sourceId: quotes.length > 0 ? "yahoo-finance-chart" : "local-sample",
      error: quotes.length > 0 ? undefined : quoteError instanceof Error ? quoteError.message : "Unknown quote error",
      delayed: true,
      updatedAt: latestQuoteTimestamp(quotes),
      fetchedAt,
      quotes,
    } satisfies QuotePayload;
    if (quotes.length > 0) quoteCache.set(cacheKey, { expiresAt: Date.now() + QUOTE_CACHE_TTL_MS, payload: quotePayload });
    return NextResponse.json({ ...quotePayload, cacheStatus: "miss" });
  }
}

function latestQuoteTimestamp(quotes: NormalizedQuote[]) {
  return quotes
    .map((quote) => quote.updatedAt)
    .filter((value): value is string => Boolean(value && Number.isFinite(new Date(value).getTime())))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

async function mapWithConcurrency<T, TResult>(items: T[], concurrency: number, worker: (item: T) => Promise<TResult>) {
  const results = new Array<TResult>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function normalizeQuoteResult(item: YahooQuote): NormalizedQuote {
  const price = item.regularMarketPrice ?? 0;
  const prevClose = item.regularMarketPreviousClose ?? price;
  const afterHours = item.postMarketPrice ?? price;
  return {
    symbol: item.symbol,
    price,
    prevClose,
    afterHours,
    change: item.regularMarketChange ?? price - prevClose,
    changePercent: item.regularMarketChangePercent ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0),
    afterChange: item.postMarketChange ?? afterHours - price,
    afterChangePercent: item.postMarketChangePercent ?? (price ? ((afterHours - price) / price) * 100 : 0),
    marketCap: formatCompact(item.marketCap),
    volume: formatCompact(item.regularMarketVolume),
    marketState: item.marketState,
    updatedAt: item.regularMarketTime ? new Date(item.regularMarketTime * 1000).toISOString() : undefined,
    name: item.shortName,
  };
}

async function fetchChartQuote(symbol: string): Promise<NormalizedQuote | null> {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m&includePrePost=true`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 NimbusDaily/1.0 quote dashboard",
      },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta?.symbol) return null;

    const lastClose = getLastClose(result?.indicators?.quote?.[0]?.close);
    const price = meta.regularMarketPrice ?? lastClose;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;
    const afterHours = lastClose ?? price;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPreviousClose ?? price;
    return {
      symbol: meta.symbol,
      price,
      prevClose,
      afterHours,
      change: price - prevClose,
      changePercent: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
      afterChange: afterHours - price,
      afterChangePercent: price ? ((afterHours - price) / price) * 100 : 0,
      marketCap: formatCompact(meta.marketCap),
      volume: formatCompact(meta.regularMarketVolume),
      updatedAt: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : undefined,
      name: meta.longName ?? meta.shortName,
    };
  } catch {
    return null;
  }
}

function getLastClose(closes?: Array<number | null>) {
  if (!closes) return null;
  for (let index = closes.length - 1; index >= 0; index -= 1) {
    const close = closes[index];
    if (typeof close === "number" && Number.isFinite(close)) return close;
  }
  return null;
}

function formatCompact(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString("en-US");
}
