import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchNewsUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const enabled = process.env.ENABLE_REAL_DATA_SOURCES === "true" && process.env.ENABLE_NEWS_SOURCE === "true";
  const apiKey = process.env.NEWS_API_KEY;
  const query = process.env.NEWS_QUERY || "artificial intelligence OR technology";

  if (!enabled || !apiKey) {
    return {
      source: "News",
      status: "mock",
      data: [
        { title: "AI automation tools continue gaining adoption", summary: "Mock news item for Daily Brief testing." },
        { title: "Cloud dashboards focus on workflow automation", summary: "Mock market update for Nimbus Daily." },
      ],
    };
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("sortBy", "publishedAt");

  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 300 },
  });

  if (!response.ok) throw new Error(`News API failed: ${response.status}`);
  const json = await response.json();

  return {
    source: "News",
    status: "success",
    data: json.articles ?? [],
  };
}
