import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchConcertUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  return {
    source: "Concert API",
    status: "mock",
    data: [
      { artist: "Mock Artist", city: "Bangkok", date: "2026-08-01", venue: "Impact Arena" },
    ],
  };
}
