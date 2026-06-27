import { getMockDb } from "@/lib/mock-db";
import {
  createUsageStatus,
  getNumberEnv,
  listUsageEvents,
  countUsageToday,
} from "@/lib/usage-limits";
import type { AdminUsageMetrics } from "@/types/usage";

export async function getUsageMetrics(userId?: string | null): Promise<AdminUsageMetrics> {
  const db = getMockDb();
  const [runNowToday, openAiToday, telegramToday, events] = await Promise.all([
    countUsageToday("run_now", userId),
    countUsageToday("openai_call", userId),
    countUsageToday("telegram_send", userId),
    listUsageEvents(100),
  ]);

  return {
    runNowToday: createUsageStatus({
      key: "run_now_today",
      label: "Run Now Today",
      used: runNowToday,
      limit: getNumberEnv("DAILY_RUN_NOW_LIMIT", 30),
    }),
    openAiToday: createUsageStatus({
      key: "openai_today",
      label: "OpenAI Calls Today",
      used: openAiToday,
      limit: getNumberEnv("DAILY_OPENAI_CALL_LIMIT", 100),
    }),
    telegramToday: createUsageStatus({
      key: "telegram_today",
      label: "Telegram Sends Today",
      used: telegramToday,
      limit: getNumberEnv("DAILY_TELEGRAM_LIMIT", 100),
    }),
    taskCount: createUsageStatus({
      key: "tasks_total",
      label: "Tasks Per User",
      used: db.scheduledTasks.length,
      limit: getNumberEnv("MAX_TASKS_PER_USER", 50),
    }),
    events,
  };
}
