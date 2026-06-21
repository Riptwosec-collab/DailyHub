import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

type NewsArticle = {
  source?: { id?: string | null; name?: string | null } | string | null;
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  content?: string | null;
};

type ThaiNewsArticle = {
  source: string;
  title: string;
  description: string;
  url?: string | null;
  publishedAt?: string | null;
  originalTitle?: string | null;
};

function getSourceName(article: NewsArticle) {
  if (typeof article.source === "string") return article.source;
  return article.source?.name || "News";
}

function compactArticle(article: NewsArticle, index: number) {
  return {
    index: index + 1,
    source: getSourceName(article),
    title: article.title || "",
    description: article.description || article.content || "",
    url: article.url || null,
    publishedAt: article.publishedAt || null,
  };
}

function fallbackThaiArticles(articles: NewsArticle[]): ThaiNewsArticle[] {
  return articles.map((article) => ({
    source: getSourceName(article),
    title: article.title?.match(/[\u0E00-\u0E7F]/) ? article.title : `ข่าวต่างประเทศ: ${article.title || "ไม่มีหัวข้อ"}`,
    description: article.description?.match(/[\u0E00-\u0E7F]/)
      ? article.description
      : `ต้นฉบับภาษาอังกฤษ: ${article.description || article.content || "ไม่มีรายละเอียด"}`,
    url: article.url || null,
    publishedAt: article.publishedAt || null,
    originalTitle: article.title || null,
  }));
}

function extractJsonArray(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = cleaned.indexOf("[");
  const last = cleaned.lastIndexOf("]");
  return first >= 0 && last > first ? cleaned.slice(first, last + 1) : cleaned;
}

async function translateArticlesToThai(articles: NewsArticle[]) {
  const groqKey = process.env.GROQ_API_KEY;
  const enabled = process.env.AI_TRANSLATION_ENABLED === "true" || process.env.ENABLE_GROQ === "true" || process.env.ENABLE_AI === "true";
  if (!enabled || !groqKey) return fallbackThaiArticles(articles);

  try {
    const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
    const model = process.env.GROQ_TRANSLATION_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const briefArticles = articles.map(compactArticle);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "คุณคือระบบแปลข่าวของ Nimbus Daily ตอบกลับเป็น JSON array เท่านั้น ห้ามใช้ markdown และห้ามแต่งข้อเท็จจริงเพิ่ม",
          },
          {
            role: "user",
            content: `แปลรายการข่าวต่อไปนี้เป็นภาษาไทยแบบสั้น อ่านง่าย และคง source/url/publishedAt ไว้\n\nReturn JSON array only. Each item must have keys: source, title, description, url, publishedAt, originalTitle.\n\nArticles:\n${JSON.stringify(briefArticles, null, 2)}`,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq news translation failed ${response.status}: ${text.slice(0, 300)}`);
    }

    const json = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq news translation returned empty content");

    const parsed = JSON.parse(extractJsonArray(content)) as Partial<ThaiNewsArticle>[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Groq news translation did not return an array");

    return parsed.slice(0, articles.length).map((item, index) => ({
      source: item.source || getSourceName(articles[index]),
      title: item.title || fallbackThaiArticles([articles[index]])[0].title,
      description: item.description || fallbackThaiArticles([articles[index]])[0].description,
      url: item.url ?? articles[index].url ?? null,
      publishedAt: item.publishedAt ?? articles[index].publishedAt ?? null,
      originalTitle: item.originalTitle ?? articles[index].title ?? null,
    }));
  } catch (error) {
    console.error("[Nimbus Daily News] Thai news translation fallback", error instanceof Error ? error.message : String(error));
    return fallbackThaiArticles(articles);
  }
}

export async function fetchNewsUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const enabled = process.env.ENABLE_REAL_DATA_SOURCES === "true" && process.env.ENABLE_NEWS_SOURCE === "true";
  const apiKey = process.env.NEWS_API_KEY;
  const query = process.env.NEWS_QUERY || "artificial intelligence OR technology";

  if (!enabled || !apiKey) {
    const items = [
      {
        source: "Mock News",
        title: "เครื่องมือ AI automation ถูกนำไปใช้มากขึ้น",
        description: "ข่าวจำลองสำหรับทดสอบ Daily Brief ของ Nimbus Daily",
        url: null,
        publishedAt: new Date().toISOString(),
        originalTitle: "AI automation tools continue gaining adoption",
      },
      {
        source: "Mock News",
        title: "Cloud dashboard เริ่มเน้น workflow automation มากขึ้น",
        description: "ข่าวจำลองสำหรับทดสอบการสรุปข่าวและการส่ง Telegram ภาษาไทย",
        url: null,
        publishedAt: new Date().toISOString(),
        originalTitle: "Cloud dashboards focus on workflow automation",
      },
    ];

    return {
      source: "News",
      status: "mock",
      title: "News update",
      language: "th",
      items,
      data: items,
      originalContent: JSON.stringify(items, null, 2),
    };
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("sortBy", "publishedAt");

  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 300 },
  });

  if (!response.ok) throw new Error(`News API failed: ${response.status}`);
  const json = await response.json() as { articles?: NewsArticle[] };
  const articles = json.articles ?? [];
  const thaiItems = await translateArticlesToThai(articles);

  return {
    source: "News",
    status: "success",
    title: "News update",
    language: "mixed",
    originalContent: JSON.stringify(articles, null, 2),
    items: thaiItems,
    data: thaiItems,
  };
}
