import { getLatestDailyBrief } from "@/services/daily-brief.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const data = await getLatestDailyBrief({
      category: url.searchParams.get("category"),
      search: url.searchParams.get("search"),
      forceRefresh: url.searchParams.has("refresh"),
    });

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: { code: "NEWS_LATEST_FAILED", message: error instanceof Error ? error.message : "Failed to load latest news" } },
      { status: 500 },
    );
  }
}
