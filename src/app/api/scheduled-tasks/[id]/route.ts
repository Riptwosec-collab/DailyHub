import {
  errorResponse,
  normalizeBoolean,
  normalizeNumber,
  normalizeString,
  normalizeStringArray,
  readJsonBody,
  successResponse,
} from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { deleteScheduledTask, getScheduledTaskById, updateScheduledTask } from "@/lib/repositories/scheduled-tasks.repository";
import type { ScheduledTask } from "@/types/scheduled-task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await requireCurrentUser();
  const task = await getScheduledTaskById(id, user.id);
  if (!task) return errorResponse(`Scheduled task ${id} was not found`, 404, "NOT_FOUND");
  return successResponse(task);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!body) return errorResponse("Invalid JSON body", 400, "INVALID_JSON");

  const user = await requireCurrentUser();
  const patch: Partial<ScheduledTask> = {};

  if (body.name !== undefined) patch.name = normalizeString(body.name);
  if (body.type !== undefined) patch.type = normalizeString(body.type) as ScheduledTask["type"];
  if (body.scheduleType !== undefined || body.schedule_type !== undefined) {
    patch.scheduleType = normalizeString(body.scheduleType ?? body.schedule_type) as ScheduledTask["scheduleType"];
  }
  if (body.cronExpression !== undefined || body.cron_expression !== undefined) patch.cronExpression = normalizeString(body.cronExpression ?? body.cron_expression) || null;
  if (body.time !== undefined) patch.time = normalizeString(body.time) || null;
  if (body.timezone !== undefined) patch.timezone = normalizeString(body.timezone, "Asia/Bangkok");
  if (body.dataSources !== undefined || body.data_sources !== undefined) patch.dataSources = normalizeStringArray(body.dataSources ?? body.data_sources);
  if (body.gptActions !== undefined || body.gpt_actions !== undefined) patch.gptActions = normalizeStringArray(body.gptActions ?? body.gpt_actions);
  if (body.outputChannels !== undefined || body.output_channels !== undefined) patch.outputChannels = normalizeStringArray(body.outputChannels ?? body.output_channels);
  if (body.minPriorityScore !== undefined || body.min_priority_score !== undefined) patch.minPriorityScore = normalizeNumber(body.minPriorityScore ?? body.min_priority_score, 70);
  if (body.status !== undefined) patch.status = normalizeString(body.status) as ScheduledTask["status"];
  if (body.isActive !== undefined || body.is_active !== undefined) patch.isActive = normalizeBoolean(body.isActive ?? body.is_active);

  const task = await updateScheduledTask(id, patch, user.id);
  if (!task) return errorResponse(`Scheduled task ${id} was not found`, 404, "NOT_FOUND");
  return successResponse(task);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const user = await requireCurrentUser();
  const deleted = await deleteScheduledTask(id, user.id);
  if (!deleted) return errorResponse(`Scheduled task ${id} was not found`, 404, "NOT_FOUND");
  return successResponse({ id, deleted: true });
}
