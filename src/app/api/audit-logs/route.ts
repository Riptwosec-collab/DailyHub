import { fail, getRequestId, ok } from "@/lib/api/response";
import { getAuditLogs } from "@/services/audit-log.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const url = new URL(request.url);
    const logs = await getAuditLogs({
      entityType: url.searchParams.get("entity_type"),
      entityId: url.searchParams.get("entity_id"),
      level: url.searchParams.get("level"),
      limit: Number(url.searchParams.get("limit") ?? 100),
    });

    return ok(logs, {
      requestId,
      meta: {
        total: logs.length,
      },
    });
  } catch (error) {
    return fail(error, requestId);
  }
}
