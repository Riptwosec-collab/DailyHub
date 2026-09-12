import { fail, getRequestId, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { EXPECTED_DEFAULT_TASK_COUNT } from "@/lib/default-scheduled-tasks";
import { getMockDb } from "@/lib/mock-db";
import { listNotifications } from "@/lib/repositories/notifications.repository";
import { listScheduledTasks } from "@/lib/repositories/scheduled-tasks.repository";
import { listTaskRuns } from "@/lib/repositories/task-runs.repository";
import { getLatestDailyBrief } from "@/services/daily-brief.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isTelegramSent(status?: string | null) {
  return status === "sent" || Boolean(status?.startsWith("mock_sent"));
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    const mockDb = user ? null : getMockDb();

    const [tasks, runs, notifications, dailyBrief] = await Promise.all([
      user ? listScheduledTasks({ userId: user.id }) : Promise.resolve(mockDb?.scheduledTasks ?? []),
      user ? listTaskRuns({ userId: user.id }) : Promise.resolve(mockDb?.taskRuns ?? []),
      user ? listNotifications({ userId: user.id }) : Promise.resolve(mockDb?.webNotifications ?? []),
      getLatestDailyBrief(),
    ]);

    const activeTasks = tasks.filter((task) => task.isActive).length;
    const failedTasks = tasks.filter((task) => task.status === "Failed" || !task.isActive).length;
    const telegramSent = runs.filter((run) => isTelegramSent(run.telegramStatus)).length;
    const latestRunAt = runs
      .map((run) => run.startedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

    return ok({
      tasks,
      runs,
      notifications,
      dailyBrief,
      summary: {
        expectedTaskCount: EXPECTED_DEFAULT_TASK_COUNT,
        taskCount: tasks.length,
        activeTasks,
        failedTasks,
        runCount: runs.length,
        notificationCount: notifications.length,
        telegramSent,
        latestRunAt,
        dailyBriefItems: dailyBrief.summary.totalItems,
        dailyBriefMode: dailyBrief.summary.mode,
        mode: user ? (user.isMock ? "mock-user" : "authenticated") : "public-demo",
        generatedAt: new Date().toISOString(),
      },
    }, { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}
