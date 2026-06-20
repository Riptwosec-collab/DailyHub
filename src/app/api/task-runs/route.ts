import { errorResponse, getSearchParam, normalizeString } from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { listTaskRuns } from "@/lib/repositories/task-runs.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const runs = await listTaskRuns({
      userId: user.id,
      taskId: normalizeString(getSearchParam(request, "task_id") ?? getSearchParam(request, "taskId")),
      status: normalizeString(getSearchParam(request, "status")),
    });

    return Response.json({ success: true, data: runs, meta: { total: runs.length } });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to list task runs", 401, "BAD_REQUEST");
  }
}
