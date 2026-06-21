import { requireCurrentUser } from "@/lib/auth";
import { errorResponse, readJsonBody, successResponse } from "@/lib/mock-db";
import { getUserSettings, updateUserSettings } from "@/lib/repositories/settings.repository";
import type { UpdateNimbusDailySettingsInput } from "@/types/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const settings = await getUserSettings(user.id);
    return successResponse(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load settings";
    return errorResponse(message, 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(request: Request) {
  const body = await readJsonBody<UpdateNimbusDailySettingsInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400, "INVALID_JSON");

  try {
    const user = await requireCurrentUser();
    const settings = await updateUserSettings(user.id, body);
    return successResponse(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return errorResponse(message, 500, "INTERNAL_ERROR");
  }
}
