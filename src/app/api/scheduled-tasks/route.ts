import {
  errorResponse,
  getSearchParam,
  normalizeBoolean,
  normalizeNumber,
  normalizeString,
  normalizeStringArray,
  readJsonBody,
  successResponse,
} from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { createScheduledTask, listScheduledTasks } from "@/lib/repositories/scheduled-tasks.repository";
import type { ScheduledTask } from "@/types/scheduled-task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const tasks = await listScheduledTasks({
      userId: user.id,
      search: normalizeString(getSearchParam(request, "search")),
      type: normalizeString(getSearchParam(request, "type")),
      status: normalizeString(getSearchParam(request, "status")),
      isActive: getSearchParam(request, "is_active") === null ? undefined : normalizeBoolean(getSearchParam(request, "is_active")),
    });

    return Response.json({ success: true, data: tasks, meta: { total: tasks.length, user: user.isMock ? "mock" : "supabase" } });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to list tasks", 401, "BAD_REQUEST");
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody<Record<string, unknown>>(request);
  if (!body) return errorResponse("Invalid JSON body", 400, "INVALID_JSON");

  try {
    const user = await requireCurrentUser();
    const name = normalizeString(body.name);
    if (name.length < 3) return errorResponse("Task name must be at least 3 characters", 422, "VALIDATION_ERROR");

    const task = await createScheduledTask({
      userId: user.id,
      name,
      type: normalizeString(body.type, "Custom") as ScheduledTask["type"],
      scheduleType: normalizeString(body.scheduleType ?? body.schedule_type, "Daily") as ScheduledTask["scheduleType"],
      cronExpression: normalizeString(body.cronExpression ?? body.cron_expression, "0 8 * * *"),
      time: normalizeString(body.time) || null,
      timezone: normalizeString(body.timezone, "Asia/Bangkok"),
      dataSources: normalizeStringArray(body.dataSources ?? body.data_sources, ["News"]),
      gptActions: normalizeStringArray(body.gptActions ?? body.gpt_actions, ["Summarize"]),
      outputChannels: normalizeStringArray(body.outputChannels ?? body.output_channels, ["Save to Web Dashboard"]),
      minPriorityScore: normalizeNumber(body.minPriorityScore ?? body.min_priority_score, 70),
      isActive: normalizeBoolean(body.isActive ?? body.is_active, true),
    });

    return successResponse(task, { status: 201 });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to create task", 500, "INTERNAL_ERROR");
  }
}
