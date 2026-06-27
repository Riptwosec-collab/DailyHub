import { errorResponse, successResponse } from "@/lib/mock-db";
import { getTelegramModeStatus, sendTelegramTestMessage } from "@/services/telegram.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getConfiguredSecret() {
  return process.env.CRON_SECRET || process.env.SCHEDULER_SECRET;
}

function isAuthorized(request: Request) {
  const configuredSecret = getConfiguredSecret();
  const adminSecret = process.env.ADMIN_SECRET;
  if (!configuredSecret && !adminSecret) return false;

  const authHeader = request.headers.get("authorization");
  const schedulerHeader = request.headers.get("x-scheduler-secret");
  const adminHeaderName = ["x", "admin", "secret"].join("-");
  const adminHeader = request.headers.get(adminHeaderName);

  return Boolean(
    (configuredSecret && (authHeader === `Bearer ${configuredSecret}` || schedulerHeader === configuredSecret)) ||
    (adminSecret && adminHeader === adminSecret),
  );
}

function getMessage(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("message") || "DailyHub Telegram test completed";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return errorResponse("Unauthorized Telegram test request", 401, "BAD_REQUEST");

  const telegramMode = getTelegramModeStatus();
  const telegramResult = await sendTelegramTestMessage(getMessage(request));

  const ok = telegramResult.status === "sent";
  if (!ok) {
    return errorResponse(
      `Telegram test did not send a real message: ${telegramResult.status} - ${telegramResult.message}. Mode=${telegramMode.mode}, enabled=${telegramMode.enabled}, hasToken=${telegramMode.hasToken}, hasChatId=${telegramMode.hasChatId}`,
      500,
      "INTERNAL_ERROR",
    );
  }

  return successResponse({
    success: true,
    telegramMode,
    telegramResult,
    checkedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
