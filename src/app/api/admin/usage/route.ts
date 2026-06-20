import { fail, getRequestId, ok } from "@/lib/api/response";
import { getUsageMetrics } from "@/services/usage.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    return ok(await getUsageMetrics(), { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}
