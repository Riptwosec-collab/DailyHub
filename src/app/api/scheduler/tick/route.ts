import { errorResponse, successResponse } from "@/lib/mock-db";
import { runSchedulerTick } from "@/services/scheduler.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const configuredSecret = process.env.CRON_SECRET || process.env.SCHEDULER_SECRET;
  if (!configuredSecret) return true;

  const authHeader = request.headers.get("authorization");
  const schedulerHeader = request.headers.get("x-scheduler-secret");

  return authHeader === `Bearer ${configuredSecret}` || schedulerHeader === configuredSecret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return errorResponse("Unauthorized scheduler request", 401, "BAD_REQUEST");
  const result = await runSchedulerTick();
  return successResponse(result);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return errorResponse("Unauthorized scheduler request", 401, "BAD_REQUEST");
  const result = await runSchedulerTick();
  return successResponse(result);
}
