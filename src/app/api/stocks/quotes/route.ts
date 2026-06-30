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
      .map((item) => {
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
      });

    return NextResponse.json({
      success: true,
      source: "Yahoo Finance quote endpoint",
      delayed: true,
      updatedAt: new Date().toISOString(),
      quotes,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      fallback: true,
      error: error instanceof Error ? error.message : "Unknown quote error",
      quotes: [],
      updatedAt: new Date().toISOString(),
    });
  }
}

function formatCompact(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString("en-US");
}
