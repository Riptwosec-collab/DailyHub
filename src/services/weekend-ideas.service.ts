import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchWeekendIdeasInput(_task: ScheduledTask): Promise<DataSourceResult> {
  return {
    source: "Weekend Ideas",
    status: "mock",
    data: {
      preferences: ["cafe", "photo spots", "short trip", "budget friendly"],
      location: "Bangkok",
      mood: "relaxing",
    },
  };
}
