import { fail, getRequestId, notFound, ok } from "@/lib/api/response";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { audit } from "@/services/audit-log.service";
import { regenerateTaskRun } from "@/services/task-runner.service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const requestId = getRequestId(request);
  const { id } = await context.params;

  try {
    const ip = getClientIp(request);
    assertRateLimit({
      key: `regenerate-run:${ip}:${id}`,
      limit: 8,
      windowMs: 60_000,
    });

    const run = await regenerateTaskRun(id);

    if (!run) {
      throw notFound(`Task run ${id} was not found`);
    }

    await audit({
      action: "task_run.regenerated",
      entityType: "task_run",
      entityId: id,
      message: `Task run ${id} regenerated`,
      requestId,
      metadata: {
        status: run.status,
        priorityScore: run.priorityScore,
      },
    });

    return ok(run, { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}
