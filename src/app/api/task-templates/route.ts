import { successResponse } from "@/lib/mock-db";
import { taskTemplates } from "@/lib/task-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return successResponse(taskTemplates);
}
