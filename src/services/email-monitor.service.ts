import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchEmailUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    { subject: "Security alert", from: "security@example.com", priorityHint: "high" },
    { subject: "Invoice reminder", from: "billing@example.com", priorityHint: "medium" },
  ];

  return {
    source: "Gmail",
    status: process.env.ENABLE_GMAIL_SOURCE === "true" ? "skipped" : "mock",
    title: "Email Monitor",
    originalContent: items.map((item) => `${item.subject} from ${item.from} priority ${item.priorityHint}`).join("\n"),
    language: "en",
    items,
    data: items,
  };
}
