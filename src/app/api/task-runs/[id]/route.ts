import { errorResponse, successResponse } from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { getTaskRunById } from "@/lib/repositories/task-runs.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await requireCurrentUser();
  const run = await getTaskRunById(id, user.id);
  if (!run) return errorResponse(`Task run ${id} was not found`, 404, "NOT_FOUND");
  return successResponse(run);
}
