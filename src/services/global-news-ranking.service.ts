import type { DailyBriefItem } from "../types/daily-brief.ts";

const globalCategories = new Set(["world", "market", "aiTech", "cybersecurity", "networkCloud"]);

export function scoreGlobalStory(item: DailyBriefItem, now = new Date()) {
  const published = new Date(item.publishedAt).getTime();
  const ageHours = Number.isFinite(published) ? Math.max(0, (now.getTime() - published) / 3_600_000) : 48;
  const recencyScore = Math.max(0, 30 - ageHours * 0.625);
  const sourcePriority = item.sourceMetadata?.priority ?? 60;
  const crossSourceMentionCount = 1 + item.relatedSources.length;
  const relevanceScore = globalCategories.has(item.category) ? 25 : 5;
  return sourcePriority * 0.25 + recencyScore + Math.min(20, crossSourceMentionCount * 5) + relevanceScore + item.priorityScore * 0.2;
}

export function rankGlobalTopStories(items: DailyBriefItem[], limit = 6, now = new Date()) {
  return items
    .filter((item) => globalCategories.has(item.category))
    .map((item) => ({ item, score: scoreGlobalStory(item, now) }))
    .sort((a, b) => b.score - a.score || new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime())
    .slice(0, limit)
    .map(({ item }) => item);
}
