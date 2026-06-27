import { ok } from "@/lib/api/response";
import { validateProductionEnv } from "@/lib/env";
import { isUsageLimitsEnabled } from "@/lib/usage-limits";
import { getOpenAiModeStatus } from "@/services/openai.service";
import { getTelegramModeStatus } from "@/services/telegram.service";
import { getUsageMetrics } from "@/services/usage.service";

export const runtime = "nodejs";

export async function GET() {
  const openAi = getOpenAiModeStatus();
  const telegram = getTelegramModeStatus();
  const usage = await getUsageMetrics();
  const productionEnv = validateProductionEnv();

  return ok({
    app: "NimbusDaily",
    status: productionEnv.ok ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? "development",
    modes: {
      supabase: process.env.USE_SUPABASE === "true" ? "real" : "mock",
      scheduler: process.env.ENABLE_SCHEDULER === "true" ? "enabled" : "disabled",
      openai: openAi.mode,
      telegram: telegram.mode,
      usageLimits: isUsageLimitsEnabled() ? "enabled" : "disabled",
    },
    checks: {
      hasCronSecret: Boolean(process.env.CRON_SECRET || process.env.SCHEDULER_SECRET),
      hasOpenAiKey: openAi.hasApiKey,
      hasTelegramToken: telegram.hasToken,
      hasTelegramChatId: telegram.hasChatId,
      productionEnv,
    },
    usage: {
      runNowRemaining: usage.runNowToday.remaining,
      openAiRemaining: usage.openAiToday.remaining,
      telegramRemaining: usage.telegramToday.remaining,
    },
  });
}
