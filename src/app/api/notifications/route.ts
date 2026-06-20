import { errorResponse, getSearchParam, normalizeBoolean, normalizeString } from "@/lib/mock-db";
import { requireCurrentUser } from "@/lib/auth";
import { listNotifications } from "@/lib/repositories/notifications.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const isReadParam = getSearchParam(request, "is_read") ?? getSearchParam(request, "isRead");
    const importantParam = getSearchParam(request, "important");

    const notifications = await listNotifications({
      userId: user.id,
      isRead: isReadParam === null ? undefined : normalizeBoolean(isReadParam),
      important: importantParam === null ? undefined : normalizeBoolean(importantParam),
      type: normalizeString(getSearchParam(request, "type")),
    });

    return Response.json({ success: true, data: notifications, meta: { total: notifications.length } });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to list notifications", 401, "BAD_REQUEST");
  }
}
