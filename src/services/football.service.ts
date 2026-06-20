import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchFootballUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  return {
    source: "Football API",
    status: "mock",
    data: [
      { match: "Team A vs Team B", score: "2-1", highlight: "Late winning goal" },
      { match: "Team C vs Team D", score: "0-0", highlight: "Strong defensive game" },
    ],
  };
}
