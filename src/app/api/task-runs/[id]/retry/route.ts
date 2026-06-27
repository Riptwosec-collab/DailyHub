import { fail, getRequestId, notFound, ok } from "@/lib/api/response";
import { getMockDb } from "@/lib/mock-db";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { audit } from "@/services/audit-log.service";
import { runTaskNow } from "@/services/task-runner.service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const requestId = getRequestId(request);
  const { id } = await context.params;

  try {
    const ip = getClientIp(request);
    await assertRateLimit({
      key: `retry-run:${ip}:${id}`,
      limit: 5,
      windowMs: 60_000,
    });

    const db = getMockDb();
    const run = db.taskRuns.find((item) => item.id === id);

    if (!run) {
      throw notFound(`Task run ${id} was not found`);
    }

    await audit({
      action: "task_run.retry.requested",
      entityType: "task_run",
      entityId: id,
      message: `Retry requested for task run ${id}`,
      requestId,
      metadata: {
        taskId: run.taskId,
        previousStatus: run.status,
      },
    });

    const result = await runTaskNow(run.taskId);

    if (!result) {
      throw notFound(`Task ${run.taskId} was not found`);
    }

    await audit({
      action: "task_run.retry.completed",
      entityType: "task_run",
      entityId: id,
      message: `Retry completed for task run ${id}`,
      requestId,
      metadata: {
        newTaskRunId: result.taskRun.id,
        taskId: run.taskId,
      },
    });

    return ok(
      {
        originalRun: run,
        task: result.task,
        taskRun: result.taskRun,
        notification: result.notification,
        message: "Retry completed and created a new task run.",
      },
      { requestId },
    );
  } catch (error) {
    await audit({
      action: "task_run.retry.failed",
      entityType: "task_run",
      entityId: id,
      level: "error",
      message: `Retry failed for task run ${id}`,
      requestId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return fail(error, requestId);
  }
}
