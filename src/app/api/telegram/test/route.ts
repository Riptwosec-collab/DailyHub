import { errorResponse, readJsonBody, successResponse } from "@/lib/mock-db";
import { getTelegramModeStatus, sendTelegramTestMessage } from "@/services/telegram.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJsonBody<{ message?: string }>(request);
  const result = await sendTelegramTestMessage(body?.message);
  const mode = getTelegramModeStatus();

  if (result.status === "failed" || result.status === "failed_missing_config") {
    return errorResponse(result.message, 500, "INTERNAL_ERROR");
  }

  return successResponse({ mode, result });
}
