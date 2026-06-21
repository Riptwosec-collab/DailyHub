import type { ContentLanguage } from "@/types/translation";
import type { ScheduledTask } from "@/types/scheduled-task";
import { fetchConcertUpdates } from "./concert.service";
import { fetchEmailUpdates } from "./email-monitor.service";
import { fetchFootballUpdates } from "./football.service";
import { fetchNewsUpdates } from "./news.service";
import { fetchSaleUpdates } from "./sale-monitor.service";
import { fetchWeatherUpdates } from "./weather.service";
import { fetchWeekendIdeasInput } from "./weekend-ideas.service";

export interface StandardDataSourcePayload {
  title: string;
  source: string;
  originalContent: string;
  language?: ContentLanguage;
  items: unknown[];
}

export interface DataSourceResult {
  source: string;
  status: "success" | "mock" | "skipped" | "failed";
  data: unknown;
  title?: string;
  originalContent?: string;
  language?: ContentLanguage;
  items?: unknown[];
  error?: string;
}

export function toStandardDataSourcePayload(result: DataSourceResult): StandardDataSourcePayload {
  const items = result.items ?? (Array.isArray(result.data) ? result.data : result.data ? [result.data] : []);
  return {
    title: result.title || `${result.source} update`,
    source: result.source,
    originalContent: result.originalContent || JSON.stringify(result.data ?? items, null, 2),
    language: result.language,
    items,
  };
}

async function safeSource(source: string, handler: () => Promise<DataSourceResult>): Promise<DataSourceResult> {
  try {
    const result = await handler();
    const standard = toStandardDataSourcePayload(result);
    return { ...result, ...standard };
  } catch (error) {
    return {
      source,
      status: "failed",
      data: null,
      title: `${source} failed`,
      originalContent: error instanceof Error ? error.message : "Unknown data source error",
      language: "unknown",
      items: [],
      error: error instanceof Error ? error.message : "Unknown data source error",
    };
  }
}

export async function collectTaskDataSources(task: ScheduledTask) {
  const sources = task.dataSources.length > 0 ? task.dataSources : ["News"];
  const results = await Promise.all(
    sources.map((source) => {
      if (source === "News") return safeSource(source, () => fetchNewsUpdates(task));
      if (source === "Gmail") return safeSource(source, () => fetchEmailUpdates(task));
      if (source === "Product Prices") return safeSource(source, () => fetchSaleUpdates(task));
      if (source === "Football API") return safeSource(source, () => fetchFootballUpdates(task));
      if (source === "Weather API") return safeSource(source, () => fetchWeatherUpdates(task));
      if (source === "Concert API") return safeSource(source, () => fetchConcertUpdates(task));
      return safeSource(source, () => fetchWeekendIdeasInput(task));
    }),
  );

  return {
    task: {
      id: task.id,
      name: task.name,
      type: task.type,
      scheduleType: task.scheduleType,
      timezone: task.timezone,
    },
    collectedAt: new Date().toISOString(),
    sources: results,
  };
}
