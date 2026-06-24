import { fail, getRequestId, ok } from "@/lib/api/response";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { assertDailyUsageLimit, recordUsageEvent } from "@/lib/usage-limits";
import { audit } from "@/services/audit-log.service";
import { runSchedulerTick } from "@/services/scheduler.service";

export const runtime = "nodejs";

function isTelegramSent(status: unknown) {
  return typeof status === "string" && (status === "sent" || status.startsWith("mock_sent"));
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const ip = getClientIp(request);
    assertRateLimit({ key: `run-all:${ip}`, limit: 3, windowMs: 60_000 });
    assertDailyUsageLimit({
      type: "run_now",
      label: "Run All Now",
      limitEnvName: "DAILY_RUN_ALL_LIMIT",
      fallbackLimit: 50,
    });

    await audit({
      action: "scheduled_task.run_all.requested",
      entityType: "scheduled_task",
      message: "Run All Now requested from dashboard with forced Telegram",
      requestId,
    });

    const result = await runSchedulerTick({ force: true });
    const sentCount = result.results.filter((item) => isTelegramSent(item.telegramStatus)).length;
    const failedCount = result.results.filter((item) => item.status === "failed" || String(item.telegramStatus ?? "").includes("failed")).length;

    recordUsageEvent({
      type: "run_now",
      metadata: {
        mode: "run_all",
        taskCount: result.results.length,
        sentCount,
        failedCount,
      },
    });

    if (sentCount > 0) {
      recordUsageEvent({ type: "telegram_send", metadata: { mode: "run_all", sentCount } });
    }

    await audit({
      action: "scheduled_task.run_all.completed",
      entityType: "scheduled_task",
      message: `Run All Now completed: ${sentCount}/${result.results.length} Telegram sent`,
      requestId,
      metadata: {
        taskCount: result.results.length,
        sentCount,
        failedCount,
      },
    });

    return ok(
      {
        ...result,
        summary: {
          taskCount: result.results.length,
          sentCount,
          failedCount,
        },
      },
      { requestId },
    );
  } catch (error) {
    await audit({
      action: "scheduled_task.run_all.failed",
      entityType: "scheduled_task",
      level: "error",
      message: "Run All Now failed",
      requestId,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });

    return fail(error, requestId);
  }
}
