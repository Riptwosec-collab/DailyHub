import { normalizeSearchQuery, tokenizeSearchQuery } from "@/lib/search/normalize-search-query";
import type { SearchCategory, SearchDateFilter, SearchIntent } from "@/types/search";

const categoryAliases: Record<Exclude<SearchCategory, "all">, string[]> = {
  daily: ["dy", "ข่าว", "ข่าววันนี้", "ข่าวล่าสุด", "news", "daily brief"],
  stocks: ["st", "หุ้น", "ตลาดหุ้น", "stock", "stocks", "ticker", "nasdaq", "nyse"],
  concerts: ["cn", "คอนเสิร์ต", "ศิลปิน", "concert", "live music"],
  movies: ["mv", "หนัง", "ภาพยนตร์", "หนังโรง", "netflix", "movie", "cinema", "series", "ซีรีส์"],
  events: ["ev", "อีเวนต์", "งานแฟร์", "นิทรรศการ", "expo", "fair", "event"],
};

function detectCategory(normalized: string): SearchCategory {
  let best: { category: SearchCategory; length: number } = { category: "all", length: 0 };
  for (const [category, aliases] of Object.entries(categoryAliases) as Array<[Exclude<SearchCategory, "all">, string[]]>) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeSearchQuery(alias);
      if (normalized === normalizedAlias || normalized.includes(normalizedAlias)) {
        if (normalizedAlias.length > best.length) best = { category, length: normalizedAlias.length };
      }
    }
  }
  return best.category;
}

function detectDateFilter(normalized: string): SearchDateFilter {
  // Keep Thai date phrases as escapes so parsing is stable across Windows encodings.
  if (normalized.includes("\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49") || normalized.includes("today")) return "today";
  if (normalized.includes("\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e2b\u0e19\u0e49\u0e32") || normalized.includes("next month")) return "next-month";
  if (normalized.includes("\u0e40\u0e14\u0e37\u0e2d\u0e19\u0e19\u0e35\u0e49") || normalized.includes("this month")) return "this-month";
  return null;
}

export function detectSearchIntent(query: string): SearchIntent {
  const normalizedQuery = normalizeSearchQuery(query);
  return {
    category: detectCategory(normalizedQuery),
    dateFilter: detectDateFilter(normalizedQuery),
    normalizedQuery,
    tokens: tokenizeSearchQuery(query),
  };
}
