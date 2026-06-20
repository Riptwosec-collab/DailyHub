import { errorResponse, readJsonBody, successResponse } from "@/lib/mock-db";
import { getDailyHubSettings, updateDailyHubSettings } from "@/lib/settings-store";
import type { UpdateDailyHubSettingsInput } from "@/types/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return successResponse(getDailyHubSettings());
}

export async function PATCH(request: Request) {
  const body = await readJsonBody<UpdateDailyHubSettingsInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400, "INVALID_JSON");

  const settings = updateDailyHubSettings(body);
  return successResponse(settings);
}
