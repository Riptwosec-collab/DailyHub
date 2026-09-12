import type { DailyBriefCategoryKey, DailyBriefItem } from "@/types/daily-brief";
import { translateToThai } from "@/services/translation.service";

interface NewsDataArticle {
  article_id?: string;
  title?: string;
  link?: string;
  image_url?: string | null;
  description?: string;
  content?: string;
  pubDate?: string;
  pubDateTZ?: string;
  source_id?: string;
  source_name?: string;
  language?: string;
  country?: string[] | string;
  category?: string[] | string;
  keywords?: string[] | null;
}

interface NewsDataResponse {
  status?: string;
  totalResults?: number;
  results?: NewsDataArticle[];
  nextPage?: string;
  message?: string;
}

const CATEGORY_QUERY: Partial<Record<DailyBriefCategoryKey, string>> = {
  thai: "Thailand politics economy society breaking news",
  world: "world geopolitics economy international news",
  aiTech: "OpenAI Anthropic Google AI Microsoft AI developer tools artificial intelligence",
  cybersecurity: "cybersecurity vulnerability CVE data breach malware phishing security advisory",
  networkCloud: "Cisco Fortinet Palo Alto Cloudflare AWS Azure Google Cloud Vercel GitHub outage infrastructure",
  market: "US stock market bitcoin crypto gold dollar semiconductor earnings stocks",
  weatherPm25: "Thailand weather rain PM2.5 Bangkok forecast",
  traffic: "Bangkok traffic BTS MRT disruption flood road closure",
  todayTasks: "GitHub Vercel automation scheduler DevOps outage cloud workflow",
  importantEmail: "email security phishing Gmail invoice scam alert",
  sports: "football soccer Thai League Premier League fixture result score",
  events: "concert event product launch exhibition Thailand Bangkok",
  deals: "Shopee Lazada gadget software domain hosting promotion discount",
  publicAlerts: "Thailand government announcement public alert BTS MRT disruption public service",
  travelDeals: "Thailand flight deals airfare hotel room rate travel promotion resort package",
  lifestyle: "Thailand restaurant cafe buffet weekend activities lifestyle travel food",
};

type FetchableDailyBriefCategory = Exclude<DailyBriefCategoryKey, "all">;

type GoogleNewsRssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  sourceName: string;
  sourceUrl?: string;
  imageUrl?: string;
};

const REAL_NEWS_TARGET_COUNT = Math.max(8, Number(process.env.NEWS_ITEMS_PER_CATEGORY || "10"));
const GOOGLE_NEWS_TIMEOUT_MS = Math.max(2500, Number(process.env.GOOGLE_NEWS_TIMEOUT_MS || "8500"));
const NEWS_MAX_AGE_HOURS = Math.max(12, Number(process.env.NEWS_MAX_AGE_HOURS || "72"));
const NEWS_MAX_AGE_MS = NEWS_MAX_AGE_HOURS * 60 * 60 * 1000;

const BLOCKED_NEWS_PATTERN = /(คาสิโน|พนัน|การพนัน|เดิมพัน|แทงบอล|บาคาร่า|สล็อต|เครดิตฟรี|โบนัส|หวย|casino|gambling|betting|bookmaker|wager|jackpot|free\s*bet|odds)/i;
const PAID_ONLY_PATTERN = /(only available in paid plans|subscribe to read|subscription required|paywall|sign in to read)/i;
const LOW_QUALITY_SOURCE_PATTERN = /(facebook\.com|today\.line\.me|4tamilmedia|portal imbiara)/i;

const GOOGLE_NEWS_CATEGORIES: FetchableDailyBriefCategory[] = [
  "thai",
  "world",
  "aiTech",
  "cybersecurity",
  "networkCloud",
  "market",
  "weatherPm25",
  "traffic",
  "todayTasks",
  "importantEmail",
  "sports",
  "events",
  "deals",
  "publicAlerts",
  "travelDeals",
  "lifestyle",
];

const GOOGLE_NEWS_QUERY: Record<FetchableDailyBriefCategory, string[]> = {
  thai: ["ข่าวไทยวันนี้ การเมือง เศรษฐกิจไทย สังคม อุบัติเหตุ"],
  world: ["ข่าวต่างประเทศ ข่าวโลก เศรษฐกิจโลก สงคราม ภูมิรัฐศาสตร์"],
  aiTech: ["OpenAI OR Anthropic OR Claude OR ChatGPT OR Gemini OR Google AI OR Microsoft Copilot", "artificial intelligence OR generative AI OR developer tools OR startup"],
  cybersecurity: ["ความปลอดภัยไซเบอร์ ข้อมูลรั่ว มัลแวร์ phishing CVE", "cybersecurity vulnerability CVE malware phishing security advisory"],
  networkCloud: ["Cloudflare AWS Azure Google Cloud GitHub Vercel outage", "Cisco Fortinet Palo Alto network outage infrastructure"],
  market: ["ตลาดหุ้นสหรัฐ Bitcoin crypto ทอง ดอลลาร์ semiconductor", "NVDA semiconductor stocks stock market bitcoin gold"],
  weatherPm25: ["สภาพอากาศวันนี้ ฝน อุณหภูมิ PM2.5 กรุงเทพ ประเทศไทย"],
  traffic: ["จราจร รถติด BTS MRT น้ำท่วม เส้นทางสำคัญ", "Bangkok traffic BTS disruption MRT disruption flood"],
  todayTasks: ["GitHub Actions Vercel cron scheduler automation", "scheduled task job failure automation outage cloud outage DevOps"],
  importantEmail: ["อีเมลหลอกลวง phishing Gmail security alert invoice", "Gmail phishing invoice scam email security warning"],
  sports: ["ผลบอล ตารางแข่ง ข่าวฟุตบอล ไทยลีก พรีเมียร์ลีก", "football soccer match fixture result Thai League Premier League"],
  events: ["คอนเสิร์ต อีเวนต์ เปิดตัวสินค้า ศิลปิน กรุงเทพ", "Thailand event concert product launch exhibition Bangkok"],
  deals: ["Shopee Lazada gadget software domain hosting โปรโมชั่น", "promotion discount gadget deals software deals hosting deal"],
  publicAlerts: ["ประกาศสำคัญ แจ้งเตือนรัฐ BTS ขัดข้อง MRT ขัดข้อง ปิดถนน", "government notice public alert BTS disruption MRT disruption Thailand"],
  travelDeals: ["โปรตั๋วเครื่องบิน โปรโมชั่นโรงแรม เที่ยวไทย flight deals hotel deals", "airline sale hotel promotion Thailand travel deals"],
  lifestyle: ["ร้านอาหาร คาเฟ่ บุฟเฟ่ต์ ที่เที่ยว กิจกรรมวันหยุด กรุงเทพ", "Thailand restaurant cafe buffet weekend activities lifestyle"],
};

function truncate(value: string, max = 620) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function hasThaiText(value: string) {
  return /[\u0E00-\u0E7F]/.test(value);
}

function decodeXml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\"",
  };

  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      return named[entity.toLowerCase()] ?? match;
    });
}

function stripHtml(value: string) {
  return decodeXml(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getXmlTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function getXmlTagAttribute(block: string, tag: string, attribute: string) {
  const match = block.match(new RegExp(`<${tag}\\b([^>]*)>`, "i"));
  if (!match) return "";
  const attrMatch = match[1].match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));
  return attrMatch ? decodeXml(attrMatch[1]).trim() : "";
}

function normalizeRssImageUrl(value: string) {
  const decoded = decodeXml(value).trim();
  if (!decoded) return "";
  if (decoded.startsWith("//")) return `https:${decoded}`;
  if (/^https?:\/\//i.test(decoded)) return decoded;
  return "";
}

function extractRssImage(block: string) {
  const decodedBlock = decodeXml(block);
  const imageFromTag = decodedBlock.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)?.[1];
  if (imageFromTag) return normalizeRssImageUrl(imageFromTag);
  const mediaContent = getXmlTagAttribute(block, "media:content", "url") || getXmlTagAttribute(block, "media:thumbnail", "url");
  return normalizeRssImageUrl(mediaContent);
}

function parseGoogleNewsRss(xml: string): GoogleNewsRssItem[] {
  return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi))
    .map((match) => {
      const block = match[0];
      const title = stripHtml(getXmlTag(block, "title"));
      const link = stripHtml(getXmlTag(block, "link"));
      const description = stripHtml(getXmlTag(block, "description"));
      const pubDate = stripHtml(getXmlTag(block, "pubDate"));
      const sourceName = stripHtml(getXmlTag(block, "source")) || "Google News";
      const sourceUrl = getXmlTagAttribute(block, "source", "url");
      const imageUrl = extractRssImage(block);
      return { title, link, description, pubDate, sourceName, sourceUrl, imageUrl };
    })
    .filter((item) => item.title && item.link);
}

function buildGoogleNewsRssUrl(query: string) {
  const url = new URL("https://news.google.com/rss/search");
  const days = Math.max(1, Math.ceil(NEWS_MAX_AGE_HOURS / 24));
  url.searchParams.set("q", `${query} when:${days}d`);
  url.searchParams.set("hl", process.env.GOOGLE_NEWS_HL || "th");
  url.searchParams.set("gl", process.env.GOOGLE_NEWS_GL || "TH");
  url.searchParams.set("ceid", process.env.GOOGLE_NEWS_CEID || "TH:th");
  return url.toString();
}

async function fetchGoogleNewsXml(query: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_NEWS_TIMEOUT_MS);

  try {
    const response = await fetch(buildGoogleNewsRssUrl(query), {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "User-Agent": "NimbusDaily/1.0 (+https://nimbusdaily.vercel.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });
    if (!response.ok) throw new Error(`Google News RSS failed: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function isRecentDate(value?: string | null) {
  if (!value) return true;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return true;
  const age = Date.now() - time;
  return age >= -6 * 60 * 60 * 1000 && age <= NEWS_MAX_AGE_MS;
}

function textFromRssItem(item: GoogleNewsRssItem) {
  return [item.title, item.description, item.sourceName].filter(Boolean).join(" ");
}

function textFromDailyItem(item: DailyBriefItem) {
  return [item.title, item.titleTh, item.summaryTh, item.rawDescription, item.extractedText, item.sourceName, item.tags.join(" ")].filter(Boolean).join(" ");
}

function articleCategoryText(article: NewsDataArticle) {
  return Array.isArray(article.category) ? article.category.join(" ") : article.category || "";
}

function articleText(article: NewsDataArticle) {
  return [article.title, article.description, article.content, articleCategoryText(article), article.keywords?.join(" "), getSourceName(article)].filter(Boolean).join(" ");
}

function isBlockedSource(source?: string | null) {
  return Boolean(source && LOW_QUALITY_SOURCE_PATTERN.test(source));
}

function isBlockedText(text: string) {
  return BLOCKED_NEWS_PATTERN.test(text) || PAID_ONLY_PATTERN.test(text);
}

function hasUsefulText(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length >= 28 && !isBlockedText(compact);
}

function categoryMatchesText(category: DailyBriefCategoryKey, text: string) {
  if (category === "all") return true;
  if (category === "thai") return /ข่าวไทย|ไทย|thailand|bangkok|กรุงเทพ|รัฐบาล|เศรษฐกิจไทย|สังคม|อุบัติเหตุ/i.test(text);
  if (category === "world") return true;
  if (category === "cybersecurity") return /cybersecurity|security advisory|vulnerability|\bcve\b|malware|phishing|ransomware|data breach|ข้อมูลรั่ว|มัลแวร์|ฟิชชิ่ง|ไซเบอร์/i.test(text);
  if (category === "networkCloud") return /cisco|fortinet|palo alto|cloudflare|\baws\b|azure|google cloud|vercel|github|network|infrastructure|outage|คลาวด์|ระบบล่ม/i.test(text);
  if (category === "market") return /stock|nasdaq|nyse|bitcoin|crypto|gold|dollar|semiconductor|nvda|amd|tsm|earnings|ตลาดหุ้น|ราคาทอง|หุ้น|คริปโต|บิตคอยน์|ดอลลาร์/i.test(text);
  if (category === "weatherPm25") return /weather|forecast|rain|temperature|pm2\.5|air quality|สภาพอากาศ|ฝน|อุณหภูมิ|ฝุ่น/i.test(text);
  if (category === "traffic") return /traffic|commute|road|flood|bts|mrt|transit|รถติด|จราจร|น้ำท่วม|ปิดถนน|รถไฟฟ้า/i.test(text);
  if (category === "todayTasks") return /github actions|vercel|cron|scheduler|automation|workflow|devops|job failure|scheduled task|งานวันนี้|ระบบอัตโนมัติ/i.test(text);
  if (category === "importantEmail") return /email|gmail|inbox|invoice|phishing|scam|security alert|อีเมล|ใบแจ้งหนี้|หลอกลวง/i.test(text);
  if (category === "sports") return /football|soccer|match|fixture|score|premier league|thai league|fifa|uefa|afc|nfl|quarterback|ผลบอล|ฟุตบอล|ไทยลีก|พรีเมียร์ลีก|ตารางแข่ง|สรุปหลังเกม/i.test(text);
  if (category === "events") return /concert|event|exhibition|festival|artist|ticket|product launch|คอนเสิร์ต|อีเวนต์|นิทรรศการ|ศิลปิน|เปิดตัวสินค้า/i.test(text);
  if (category === "deals") return /deal|discount|promotion|sale|shopee|lazada|gadget|software|hosting|domain|โปร|โปรโมชั่น|ลดราคา/i.test(text);
  if (category === "publicAlerts") return /government|public alert|official notice|announcement|bts|mrt|train disruption|road closure|ประกาศ|แจ้งเตือนรัฐ|หน่วยงานรัฐ|ขัดข้อง|ปิดถนน|บริการสาธารณะ/i.test(text);
  if (category === "travelDeals") return /flight|airfare|airline|hotel|resort|room rate|travel promotion|travel deal|package tour|ตั๋วเครื่องบิน|โปรบิน|สายการบิน|โรงแรม|ห้องพัก|รีสอร์ต|แพ็กเกจเที่ยว|โปรท่องเที่ยว|เที่ยวไทย/i.test(text);
  if (category === "lifestyle") return /restaurant|cafe|coffee|buffet|food|weekend|lifestyle|travel|hidden gem|ร้านอาหาร|คาเฟ่|กาแฟ|บุฟเฟ่ต์|ที่เที่ยว|วันหยุด|ไลฟ์สไตล์|กิน/i.test(text);
  if (category === "aiTech") return /\bai\b|artificial intelligence|generative ai|machine learning|openai|anthropic|claude|chatgpt|gemini|microsoft copilot|google ai|developer tools?|software platform|startup|ปัญญาประดิษฐ์|เทคโนโลยี/i.test(text);
  return true;
}

function isUsableRssItem(category: DailyBriefCategoryKey, item: GoogleNewsRssItem) {
  const text = textFromRssItem(item);
  return isRecentDate(item.pubDate)
    && hasUsefulText(text)
    && !isBlockedSource(item.sourceName)
    && !isBlockedSource(item.sourceUrl)
    && categoryMatchesText(category, text);
}

function isUsableNewsDataArticle(article: NewsDataArticle) {
  const text = articleText(article);
  return isRecentDate(article.pubDate)
    && hasUsefulText(text)
    && !isBlockedSource(getSourceName(article))
    && !isBlockedSource(article.link);
}

function isUsableDailyBriefItem(item: DailyBriefItem) {
  const text = textFromDailyItem(item);
  return isRecentDate(item.publishedAt)
    && hasUsefulText(text)
    && !isBlockedSource(item.sourceName)
    && !isBlockedSource(item.sourceUrl)
    && categoryMatchesText(item.category, text);
}

function buildThaiFallbackFromRealSource(item: GoogleNewsRssItem, category: DailyBriefCategoryKey) {
  const detail = CATEGORY_QUERY[category] || category;
  const original = truncate(item.description || item.title, 420);

  if (hasThaiText(original)) return original;

  return truncate(
    `แหล่งข่าว ${item.sourceName} รายงานเรื่อง "${item.title}" ในหัวข้อ ${detail}. เปิดลิงก์ต้นฉบับเพื่ออ่านรายละเอียดทั้งหมดจากแหล่งข่าวจริง`,
    520,
  );
}

function getGoogleNewsId(item: GoogleNewsRssItem, category: DailyBriefCategoryKey, index: number) {
  return `gnews_${category}_${index}_${Buffer.from(item.link).toString("base64url").slice(0, 16)}`;
}

function scoreGoogleNewsItem(category: DailyBriefCategoryKey, item: GoogleNewsRssItem, index: number) {
  const freshnessBoost = Math.max(0, 12 - index * 2);
  const urgentBoost = category === "cybersecurity" || category === "publicAlerts" || category === "traffic" ? 8 : 0;
  const textBoost = Math.min(8, Math.round((item.description || item.title).length / 120));
  return Math.min(98, 66 + freshnessBoost + urgentBoost + textBoost);
}

async function mapGoogleNewsItem(item: GoogleNewsRssItem, category: DailyBriefCategoryKey, index: number): Promise<DailyBriefItem> {
  const rawDescription = item.description || item.title;
  const sourceUrl = item.link;
  const publishedAt = item.pubDate && Number.isFinite(new Date(item.pubDate).getTime()) ? new Date(item.pubDate).toISOString() : new Date().toISOString();
  const fallbackSummary = buildThaiFallbackFromRealSource(item, category);
  const translation = await translateToThai({
    title: item.title,
    source: item.sourceName,
    content: rawDescription,
    rawInput: {
      sourceUrl,
      publishedAt,
      category,
      provider: "Google News RSS",
    },
    gptOutput: {
      title: item.title,
      summary: rawDescription,
      recommended_action: "อ่านข่าวเต็มจากแหล่งข่าวต้นฉบับ และใช้สรุปนี้เป็นข่าวย่อสำหรับ Telegram",
    },
  });
  const translatedTitle = hasThaiText(translation.translatedTitle) ? translation.translatedTitle : `ข่าวจาก ${item.sourceName}: ${item.title}`;
  const translatedSummary = hasThaiText(translation.translatedSummary) ? translation.translatedSummary : fallbackSummary;
  const translatedBullets = translation.translatedBullets
    .filter((bullet) => bullet.trim())
    .slice(0, 3)
    .map((bullet) => hasThaiText(bullet) ? bullet : `ประเด็นจากต้นฉบับ: ${bullet}`);

  return {
    id: getGoogleNewsId(item, category, index),
    title: item.title,
    titleTh: truncate(translatedTitle, 180),
    summaryTh: truncate(translatedSummary, 620),
    bulletPoints: translatedBullets.length ? translatedBullets : [
      truncate(fallbackSummary, 160),
      `แหล่งข่าวจริง: ${item.sourceName}`,
      "เปิดลิงก์ต้นฉบับเพื่ออ่านรายละเอียดเต็ม",
    ],
    whyItMatters: `ข่าวนี้มาจากแหล่งข่าวจริงผ่าน Google News RSS และอยู่ในหมวด ${category}`,
    impact: "ใช้เป็นบริบทข่าวประจำวัน ควรเปิดอ่านต้นฉบับเพื่อตรวจรายละเอียด เวลา และเงื่อนไขล่าสุด",
    category,
    tags: [category, item.sourceName, "Google News"].filter(Boolean).slice(0, 5),
    sourceName: item.sourceName,
    sourceUrl,
    imageUrl: item.imageUrl || undefined,
    publishedAt,
    language: hasThaiText(`${item.title} ${rawDescription}`) ? "th" : "en",
    priorityScore: scoreGoogleNewsItem(category, item, index),
    relatedSources: item.sourceUrl && item.sourceUrl !== sourceUrl ? [{ name: item.sourceName, url: item.sourceUrl, publishedAt }] : [],
    rawDescription,
    extractedText: rawDescription,
    isSaved: false,
    isHidden: false,
    telegramStatus: "idle",
  };
}

function uniqueRssItems(items: GoogleNewsRssItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.link.toLowerCase()}::${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchGoogleNewsCategory(category: FetchableDailyBriefCategory) {
  const settled = await Promise.allSettled(GOOGLE_NEWS_QUERY[category].map((query) => fetchGoogleNewsXml(query)));
  const rssItems = uniqueRssItems(settled.flatMap((result) => result.status === "fulfilled" ? parseGoogleNewsRss(result.value) : []))
    .filter((item) => isUsableRssItem(category, item))
    .slice(0, REAL_NEWS_TARGET_COUNT);
  return Promise.all(rssItems.map((item, index) => mapGoogleNewsItem(item, category, index)));
}

function mergeDailyBriefItems(items: DailyBriefItem[]) {
  const seen = new Set<string>();
  return items.filter(isUsableDailyBriefItem).filter((item) => {
    const key = `${item.sourceUrl.toLowerCase()}::${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchGoogleNewsLatest(category?: DailyBriefCategoryKey) {
  const categories = category && category !== "all" ? [category as FetchableDailyBriefCategory] : GOOGLE_NEWS_CATEGORIES;
  const settled = await Promise.allSettled(categories.map((key) => fetchGoogleNewsCategory(key)));
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const failed = settled.filter((result) => result.status === "rejected").length;

  return {
    mode: "real" as const,
    items: mergeDailyBriefItems(items),
    message: `Fetched ${items.length} fresh, filtered real item(s) from Google News RSS${failed ? `; ${failed} topic feed(s) failed` : ""}`,
  };
}

function detectCategory(article: NewsDataArticle): DailyBriefCategoryKey {
  const text = articleText(article).toLowerCase();
  if (categoryMatchesText("cybersecurity", text)) return "cybersecurity";
  if (categoryMatchesText("publicAlerts", text)) return "publicAlerts";
  if (categoryMatchesText("weatherPm25", text)) return "weatherPm25";
  if (categoryMatchesText("traffic", text)) return "traffic";
  if (categoryMatchesText("sports", text)) return "sports";
  if (categoryMatchesText("travelDeals", text)) return "travelDeals";
  if (categoryMatchesText("lifestyle", text)) return "lifestyle";
  if (categoryMatchesText("events", text)) return "events";
  if (categoryMatchesText("deals", text)) return "deals";
  if (categoryMatchesText("market", text)) return "market";
  if (categoryMatchesText("networkCloud", text)) return "networkCloud";
  if (categoryMatchesText("aiTech", text)) return "aiTech";
  if (categoryMatchesText("thai", text)) return "thai";
  return "world";
}

function getTags(article: NewsDataArticle, category: DailyBriefCategoryKey) {
  const raw = Array.isArray(article.keywords) ? article.keywords : [];
  const categoryTag = category.replace(/([A-Z])/g, " $1").replace(/^./, (item) => item.toUpperCase());
  return Array.from(new Set([categoryTag, ...raw.filter(Boolean).slice(0, 4)])).slice(0, 5);
}

function getSourceName(article: NewsDataArticle) {
  return article.source_name || article.source_id || "NewsData.io";
}

function asLanguage(value?: string): DailyBriefItem["language"] {
  if (value === "th" || value === "en") return value;
  return "unknown";
}

export async function mapNewsDataArticle(article: NewsDataArticle, index: number): Promise<DailyBriefItem> {
  const category = detectCategory(article);
  const title = article.title || "Untitled news";
  const description = [article.description, article.content, title].find((value) => value && hasUsefulText(value)) || title;
  const sourceUrl = article.link || "https://newsdata.io/";
  const sourceName = getSourceName(article);
  const language = asLanguage(article.language);
  const publishedAt = article.pubDate && Number.isFinite(new Date(article.pubDate).getTime()) ? new Date(article.pubDate).toISOString() : new Date().toISOString();
  const translation = await translateToThai({
    title,
    source: sourceName,
    content: description,
    rawInput: {
      sourceUrl,
      publishedAt,
      category,
      keywords: article.keywords ?? [],
      originalLanguage: article.language,
    },
    gptOutput: {
      title,
      summary: description,
      recommended_action: "อ่านข่าวเต็มจากแหล่งข่าวต้นฉบับ และใช้สรุปนี้เป็นข่าวย่อสำหรับ Telegram",
    },
  });

  return {
    id: article.article_id || `newsdata_${index}_${Buffer.from(sourceUrl).toString("base64url").slice(0, 16)}`,
    title,
    titleTh: truncate(translation.translatedTitle || title, 180),
    summaryTh: truncate(translation.translatedSummary || description, 620),
    bulletPoints: translation.translatedBullets.length ? translation.translatedBullets.slice(0, 3) : [
      truncate(translation.translatedSummary || description, 150),
      `แหล่งข่าว: ${sourceName}`,
      `หมวด: ${category}`,
    ],
    whyItMatters: "เป็นข่าวล่าสุดที่ระบบดึงจาก NewsData.io และควรอ่านต่อจากแหล่งข่าวต้นฉบับ",
    impact: "ใช้เป็นข้อมูลประกอบ Daily Brief และการส่ง Telegram ไม่ใช่บทความเต็มแบบคัดลอก",
    category,
    tags: getTags(article, category),
    sourceName,
    sourceUrl,
    imageUrl: article.image_url || undefined,
    publishedAt,
    language,
    priorityScore: Math.min(98, 68 + Math.min(24, Math.max(0, Math.round(description.length / 90))) + (category === "cybersecurity" || category === "aiTech" ? 4 : 0)),
    relatedSources: [],
    rawDescription: description,
    extractedText: article.content && hasUsefulText(article.content) ? article.content : translation.originalContent || undefined,
    isSaved: false,
    isHidden: false,
    telegramStatus: "idle",
  };
}

function buildNewsDataUrl(category?: DailyBriefCategoryKey) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://newsdata.io/api/1/latest");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("language", process.env.NEWS_LANGUAGES || "th,en");
  url.searchParams.set("country", process.env.NEWS_COUNTRIES || "th,us,gb");
  if (category && category !== "all" && CATEGORY_QUERY[category]) url.searchParams.set("q", CATEGORY_QUERY[category]);
  return url;
}

export async function fetchNewsDataLatest(category?: DailyBriefCategoryKey) {
  const url = buildNewsDataUrl(category);
  if (!url) {
    return fetchGoogleNewsLatest(category);
  }

  const googleNewsResult = await fetchGoogleNewsLatest(category);

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = await response.json() as NewsDataResponse;

    if (!response.ok || payload.status === "error") {
      throw new Error(payload.message || `NewsData request failed: ${response.status}`);
    }

    const freshNewsData = (payload.results || []).filter(isUsableNewsDataArticle);
    const newsDataItems = await Promise.all(freshNewsData.map(mapNewsDataArticle));
    const items = mergeDailyBriefItems([...newsDataItems, ...googleNewsResult.items]);

    return {
      mode: "real" as const,
      items,
      message: `Fetched ${newsDataItems.length} fresh item(s) from NewsData.io and ${googleNewsResult.items.length} fresh real item(s) from Google News RSS`,
    };
  } catch (error) {
    return {
      ...googleNewsResult,
      message: `${googleNewsResult.message}; NewsData.io skipped: ${error instanceof Error ? error.message : "unknown error"}`,
    };
  }
}
