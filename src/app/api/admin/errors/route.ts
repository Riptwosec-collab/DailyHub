import { getMockDb } from "@/lib/mock-db";
import { fail, getRequestId, ok } from "@/lib/api/response";
import { getAuditLogs } from "@/services/audit-log.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    const db = getMockDb();
    const errorLogs = await getAuditLogs({ level: "error", limit: 100 });
    const failedRuns = db.taskRuns.filter((run) => run.status === "failed").slice(0, 100);

    return ok({ errorLogs, failedRuns }, { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}
