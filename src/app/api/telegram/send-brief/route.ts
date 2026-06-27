import { getLatestDailyBrief } from "@/services/daily-brief.service";
import { sendDailyBriefToTelegram } from "@/services/daily-brief-telegram.service";
import type { DailyBriefItem, DailyBriefSummary } from "@/types/daily-brief";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(request: Request) {
  try {
    return await request.json() as { items?: DailyBriefItem[]; summary?: DailyBriefSummary };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const data = body.items?.length && body.summary ? { items: body.items, summary: body.summary } : await getLatestDailyBrief();
    const result = await sendDailyBriefToTelegram(data.summary, data.items);

    return Response.json({ success: result.status !== "failed", data: result }, { status: result.status === "failed" ? 502 : 200 });
  } catch (error) {
    return Response.json(
      { success: false, error: { code: "TELEGRAM_BRIEF_FAILED", message: error instanceof Error ? error.message : "Failed to send Daily Brief" } },
      { status: 500 },
    );
  }
}
