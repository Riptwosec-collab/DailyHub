export interface ExtractedArticle {
  url: string;
  title: string;
  text: string;
  status: "success" | "fallback" | "failed";
  message?: string;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).slice(0, 180) : "";
}

export async function extractArticleFromUrl(url: string): Promise<ExtractedArticle> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return { url, title: "", text: "", status: "failed", message: "Invalid article URL" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DailyHubBot/1.0 (+https://dailyhub.local)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { url, title: "", text: "", status: "failed", message: `Article fetch failed: ${response.status}` };
    }

    const html = await response.text();
    const text = stripHtml(html).slice(0, 8000);
    return {
      url,
      title: getTitle(html),
      text,
      status: text.length > 220 ? "success" : "fallback",
      message: text.length > 220 ? undefined : "Article text was too short, use title and description fallback",
    };
  } catch (error) {
    return {
      url,
      title: "",
      text: "",
      status: "failed",
      message: error instanceof Error ? error.message : "Article extraction failed",
    };
  }
}
