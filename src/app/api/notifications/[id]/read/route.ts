import { errorResponse, normalizeBoolean, readJsonBody, successResponse } from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { updateNotificationRead } from "@/lib/repositories/notifications.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await readJsonBody<{ isRead?: boolean; is_read?: boolean }>(request);
  if (!body) return errorResponse("Invalid JSON body", 400, "INVALID_JSON");

  const user = await requireCurrentUser();
  const isRead = normalizeBoolean(body.isRead ?? body.is_read, true);
  const notification = await updateNotificationRead(id, isRead, user.id);

  if (!notification) return errorResponse(`Notification ${id} was not found`, 404, "NOT_FOUND");
  return successResponse(notification);
}
