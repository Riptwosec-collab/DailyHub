export type SearchCategory = "all" | "daily" | "stocks" | "concerts" | "movies" | "events";

export type SearchDateFilter = "today" | "this-month" | "next-month" | null;

export type SearchIntent = {
  category: SearchCategory;
  dateFilter: SearchDateFilter;
  normalizedQuery: string;
  tokens: string[];
};

export type SearchDocument = {
  id: string;
  category: Exclude<SearchCategory, "all">;
  code: "DY" | "ST" | "CN" | "MV" | "EV";
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  keywords: string[];
  href: string;
  sourceLabel?: string;
  publishedAt?: string;
  eventDate?: string;
  active?: boolean;
};

export type SearchResult = SearchDocument & {
  score: number;
  matchReason: string;
};

export type SearchApiResponse = {
  success: boolean;
  query: string;
  intent: SearchIntent;
  results: SearchResult[];
  total: number;
  partialFailures: string[];
};
