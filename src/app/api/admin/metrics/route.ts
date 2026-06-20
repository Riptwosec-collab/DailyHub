import { getMockDb } from "@/lib/mock-db";
import { fail, getRequestId, ok } from "@/lib/api/response";
import { isUsageLimitsEnabled } from "@/lib/usage-limits";
import { getAuditLogs } from "@/services/audit-log.service";
import { getOpenAiModeStatus } from "@/services/openai.service";
import { getTelegramModeStatus } from "@/services/telegram.service";
import { getUsageMetrics } from "@/services/usage.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const db = getMockDb();
    const auditLogs = await getAuditLogs({ limit: 20 });
    const usage = await getUsageMetrics();
    const openAi = getOpenAiModeStatus();
    const telegram = getTelegramModeStatus();

    return ok(
      {
        totals: {
          tasks: db.scheduledTasks.length,
          activeTasks: db.scheduledTasks.filter((task) => task.isActive).length,
          taskRuns: db.taskRuns.length,
          successRuns: db.taskRuns.filter((run) => run.status === "success").length,
          failedRuns: db.taskRuns.filter((run) => run.status === "failed").length,
          runningRuns: db.taskRuns.filter((run) => run.status === "running").length,
          notifications: db.webNotifications.length,
          unreadNotifications: db.webNotifications.filter((item) => !item.isRead).length,
          auditLogs: auditLogs.length,
        },
        health: {
          openAiMode: openAi.mode,
          telegramMode: telegram.mode,
          schedulerEnabled: process.env.ENABLE_SCHEDULER === "true",
          supabaseEnabled: process.env.USE_SUPABASE === "true",
          usageLimitsEnabled: isUsageLimitsEnabled(),
        },
        latest: {
          tasks: db.scheduledTasks.slice(0, 5),
          runs: db.taskRuns.slice(0, 5),
          notifications: db.webNotifications.slice(0, 5),
          auditLogs,
        },
        usage,
      },
      { requestId },
    );
  } catch (error) {
    return fail(error, requestId);
  }
}
