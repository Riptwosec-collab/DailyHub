import { normalizeSearchQuery } from "@/lib/search/normalize-search-query";
import type { SearchDocument, SearchIntent, SearchResult } from "@/types/search";

function isInRequestedDate(document: SearchDocument, intent: SearchIntent, now = new Date()) {
  if (!intent.dateFilter || !document.eventDate) return true;
  const date = new Date(document.eventDate);
  if (Number.isNaN(date.getTime())) return true;
  const bangkokNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const bangkokDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  if (intent.dateFilter === "today") return bangkokDate.toDateString() === bangkokNow.toDateString();
  const offset = intent.dateFilter === "next-month" ? 1 : 0;
  const target = new Date(bangkokNow.getFullYear(), bangkokNow.getMonth() + offset, 1);
  return bangkokDate.getFullYear() === target.getFullYear() && bangkokDate.getMonth() === target.getMonth();
}

function distance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => index);
  for (let i = 1; i <= b.length; i += 1) {
    let previous = rows[0];
    rows[0] = i;
    for (let j = 1; j <= a.length; j += 1) {
      const current = rows[j];
      rows[j] = Math.min(rows[j] + 1, rows[j - 1] + 1, previous + (a[j - 1] === b[i - 1] ? 0 : 1));
      previous = current;
    }
  }
  return rows[a.length];
}

export function rankSearchDocuments(documents: SearchDocument[], query: string, intent: SearchIntent, limit = 36): SearchResult[] {
  const normalizedQuery = normalizeSearchQuery(query);
  const now = Date.now();

  return documents
    .filter((document) => document.active !== false && isInRequestedDate(document, intent))
    .map((document) => {
      const title = normalizeSearchQuery(document.title);
      const subtitle = normalizeSearchQuery(document.subtitle);
      const description = normalizeSearchQuery(document.description);
      const tags = normalizeSearchQuery([...document.tags, ...document.keywords].join(" "));
      const symbol = normalizeSearchQuery(document.code === "ST" ? document.id.replace(/^stock:/, "") : "");
      let score = intent.category === document.category ? 45 : 0;
      let matchReason = intent.category === document.category ? "ตรงกับหมวดที่ค้นหา" : "พบข้อมูลที่เกี่ยวข้อง";

      if (symbol && normalizedQuery === symbol) {
        score += 180;
        matchReason = "ตรงกับ Symbol";
      } else if (title === normalizedQuery) {
        score += 140;
        matchReason = "ตรงกับชื่อรายการ";
      } else if (title.startsWith(normalizedQuery)) {
        score += 100;
        matchReason = "ชื่อขึ้นต้นด้วยคำค้น";
      } else if (title.includes(normalizedQuery)) {
        score += 75;
        matchReason = "พบคำค้นในชื่อ";
      }

      for (const token of intent.tokens) {
        if (token.length < 2) continue;
        if (symbol === token) {
          score += 80;
          matchReason = "ตรงกับ Symbol";
        }
        if (title.includes(token)) score += 30;
        else if (subtitle.includes(token)) score += 20;
        else if (tags.includes(token)) score += 15;
        else if (description.includes(token)) score += 8;
        else if (token.length >= 4 && title.split(" ").some((word) => word.length >= 4 && distance(token, word) <= 1)) score += 6;
      }

      if (document.publishedAt) {
        const ageHours = (now - new Date(document.publishedAt).getTime()) / 3_600_000;
        if (ageHours <= 24) score += 18;
        else if (ageHours <= 168) score += 8;
      }
      if (document.eventDate && new Date(document.eventDate).getTime() >= now) score += 12;
      return { ...document, score, matchReason };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || (b.publishedAt ?? b.eventDate ?? "").localeCompare(a.publishedAt ?? a.eventDate ?? ""))
    .slice(0, limit);
}
