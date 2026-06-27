import { getDailyBriefSchedulerPreview, getLatestDailyBrief } from "@/services/daily-brief.service";
import { sendDailyBriefToTelegram } from "@/services/daily-brief-telegram.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(request: Request) {
  try {
    return await request.json() as { action?: "preview" | "run" | "retry" };
  } catch {
    return {};
  }
}

export async function GET() {
  return Response.json({ success: true, data: getDailyBriefSchedulerPreview() });
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const preview = getDailyBriefSchedulerPreview();

    if (body.action === "run" || body.action === "retry") {
      const data = await getLatestDailyBrief();
      const telegram = await sendDailyBriefToTelegram(data.summary, data.items);
      return Response.json({ success: telegram.status !== "failed", data: { scheduler: preview, telegram } });
    }

    return Response.json({ success: true, data: preview });
  } catch (error) {
    return Response.json(
      { success: false, error: { code: "DAILY_BRIEF_SCHEDULER_FAILED", message: error instanceof Error ? error.message : "Daily Brief scheduler failed" } },
      { status: 500 },
    );
  }
}
