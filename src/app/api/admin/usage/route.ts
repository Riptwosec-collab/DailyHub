import { fail, getRequestId, ok } from "@/lib/api/response";
import { requireAdminRequest } from "@/lib/auth";
import { getUsageMetrics } from "@/services/usage.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    await requireAdminRequest(request);
    return ok(await getUsageMetrics(), { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}
