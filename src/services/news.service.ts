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
  fullArticle?: string;
  keyPoints?: string[];
  whyItMatters?: string;
  readTime?: string;
  category?: string;
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
    fullArticle: article.content || article.description || "",
    keyPoints: [article.description || article.content || ""].filter(Boolean),
    whyItMatters: "เก็บไว้ใน Data Library เพื่ออ่านรายละเอียดและใช้ต่อยอดเป็นสรุปภาษาไทย",
    readTime: "2-3 นาที",
    category: "News",
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
            content: `แปลรายการข่าวต่อไปนี้เป็นภาษาไทยแบบอ่านง่าย และคง source/url/publishedAt ไว้\n\nReturn JSON array only. Each item must have keys: source, title, description, url, publishedAt, originalTitle, fullArticle, keyPoints, whyItMatters, readTime, category.\n\nArticles:\n${JSON.stringify(briefArticles, null, 2)}`,
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

    const fallback = fallbackThaiArticles(articles);
    return parsed.slice(0, articles.length).map((item, index) => ({
      source: item.source || getSourceName(articles[index]),
      title: item.title || fallback[index].title,
      description: item.description || fallback[index].description,
      url: item.url ?? articles[index].url ?? null,
      publishedAt: item.publishedAt ?? articles[index].publishedAt ?? null,
      originalTitle: item.originalTitle ?? articles[index].title ?? null,
      fullArticle: item.fullArticle || fallback[index].fullArticle,
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : fallback[index].keyPoints,
      whyItMatters: item.whyItMatters || fallback[index].whyItMatters,
      readTime: item.readTime || fallback[index].readTime,
      category: item.category || "News",
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
    const items: ThaiNewsArticle[] = [
      {
        source: "Nimbus Mock News",
        title: "AI automation ถูกนำไปใช้กับงานประจำวันมากขึ้น",
        description: "องค์กรเริ่มใช้ AI ช่วยสรุปข้อมูล ตรวจอีเมล จัดลำดับความสำคัญ และสร้าง workflow อัตโนมัติ",
        fullArticle: "กระแส AI automation กำลังขยับจากการทดลองใช้งานไปสู่การใช้งานจริงในงานประจำวันมากขึ้น โดยเฉพาะงานที่ต้องรวบรวมข้อมูลจากหลายแหล่ง เช่น ข่าว อีเมล สภาพอากาศ และข้อมูลสินค้า ระบบแบบ Nimbus Daily จึงควรเก็บข้อมูลเต็มไว้บนเว็บ แล้วส่ง Telegram เพียงสรุปสั้น เพื่อให้ผู้ใช้ไม่ถูกท่วมด้วยข้อความยาวเกินไป แต่ยังสามารถกลับมาอ่านรายละเอียดเต็มได้ทุกเมื่อ",
        keyPoints: [
          "AI ถูกใช้เพื่อสรุปข้อมูลหลายแหล่งในรอบเดียว",
          "Telegram ควรส่งสรุปสั้น ส่วนข้อมูลเต็มควรอยู่ใน Data Library",
          "ข้อมูลเต็มควรมีหัวข้อ แหล่งที่มา รายละเอียด และสิ่งที่ต้องทำต่อ",
        ],
        whyItMatters: "ทำให้ Nimbus Daily ไม่ใช่แค่ระบบแจ้งเตือน แต่เป็นคลังข้อมูลสำหรับอ่านต่อและใช้ทำคอนเทนต์ได้",
        readTime: "3 นาที",
        category: "AI / Automation",
        url: null,
        publishedAt: new Date().toISOString(),
        originalTitle: "AI automation tools continue gaining adoption",
      },
      {
        source: "Nimbus Mock News",
        title: "แดชบอร์ดยุคใหม่ต้องมีหน้าข้อมูลเต็ม ไม่ใช่แค่การ์ดสรุป",
        description: "ผู้ใช้ต้องการเห็นทั้งสรุปสั้นและรายละเอียดเต็ม เช่น รายการข่าว แหล่งข้อมูล ลิงก์ และข้อมูลดิบที่ AI ใช้วิเคราะห์",
        fullArticle: "แดชบอร์ดที่ดีควรแยกระหว่างหน้าควบคุมและหน้าข้อมูลเต็มอย่างชัดเจน หน้า Dashboard เหมาะกับการดูสถานะและกดรันงาน ส่วน Data Library ควรเป็นพื้นที่อ่านข้อมูลจริงทั้งหมดที่ระบบค้นมา เช่น ข่าวเต็ม สรุปฟุตบอลเป็นรายทีม รายการสินค้าใหม่ และบทความอ่านยาว การจัดหมวดแบบนี้ทำให้ผู้ใช้เข้าใจง่ายขึ้น และช่วยลดปัญหา Telegram ส่งข้อความยาวเกินจำเป็น",
        keyPoints: [
          "Dashboard ใช้ควบคุมงานและดูสถานะ",
          "Data Library ใช้อ่านข้อมูลเต็มแยกหมวด",
          "ทุก Telegram message ควรแนบลิงก์กลับไปอ่านข้อมูลเต็ม",
        ],
        whyItMatters: "แก้ปัญหาหน้าอ่านข่าวว่าง และทำให้ข้อมูลที่ระบบหามาไม่หายไปหลังส่งแจ้งเตือน",
        readTime: "2 นาที",
        category: "Product / Dashboard",
        url: null,
        publishedAt: new Date().toISOString(),
        originalTitle: "Modern dashboards need full data libraries",
      },
    ];

    return {
      source: "News",
      status: "mock",
      title: "News update",
      language: "th",
      items,
      data: items,
      originalContent: items.map((item) => `${item.title}\n${item.fullArticle}`).join("\n\n"),
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
