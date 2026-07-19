import { dailyNewsRetentionPolicy, isNewsWithinRetention, parseNewsTimestamp } from "../lib/news-retention.ts";
import { dedupeDailyBriefItems } from "./news-dedup.service.ts";
import type { DailyBriefCategoryKey, DailyBriefItem, DailyBriefProcessingReport } from "../types/daily-brief.ts";

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const spamPromotionSignals = [
  "เกมไพ่",
  "โบนัสกีฬา",
  "เดิมพัน",
  "รางวัลใหญ่",
  "ทดลองใช้ฟรี",
  "ชนะรางวัล",
  "โปรโมชั่น",
  "เครดิตฟรี",
  "เกมออนไลน์",
  "ผล บอล",
];

export function isLikelySpamNewsItem(item: DailyBriefItem) {
  const title = `${item.title ?? ""} ${item.titleTh ?? ""}`.normalize("NFKC").toLocaleLowerCase();
  const signalCount = spamPromotionSignals.filter((signal) => title.includes(signal)).length;
  const hasCasinoKeyword = title.includes("คาสิโนออนไลน์") || title.includes("เว็บพนัน") || title.includes("พนันออนไลน์");
  return title.length > 520 || signalCount >= 3 || (hasCasinoKeyword && signalCount >= 1);
}

export function isValidDailyBriefItem(item: DailyBriefItem) {
  return Boolean(
    item.id
      && (item.title || item.titleTh)
      && item.sourceName
      && isValidHttpUrl(item.sourceUrl)
      && parseNewsTimestamp(item.publishedAt, item.fetchedAt),
  ) && !isLikelySpamNewsItem(item);
}

function countByCategory(items: DailyBriefItem[]) {
  return items.reduce<Partial<Record<DailyBriefCategoryKey, number>>>((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, {});
}

export function processDailyBriefItems(
  items: DailyBriefItem[],
  options: { now?: Date; fetchedAt?: string; cacheStatus?: DailyBriefProcessingReport["cacheStatus"]; partialFailures?: string[] } = {},
) {
  const now = options.now ?? new Date();
  const fetchedAt = options.fetchedAt ?? now.toISOString();
  const valid = items.filter(isValidDailyBriefItem);
  const retained = valid.filter((item) => isNewsWithinRetention(item.publishedAt, now, dailyNewsRetentionPolicy.maxAgeHours, item.fetchedAt));
  const deduped = dedupeDailyBriefItems(retained);
  const beforeCounts = countByCategory(items);
  const validCounts = countByCategory(valid);
  const retainedCounts = countByCategory(retained);
  const finalCounts = countByCategory(deduped);
  const categories = Array.from(new Set(items.map((item) => item.category))).map((category) => {
    const categoryItems = deduped.filter((item) => item.category === category);
    const newSourceNames = Array.from(new Set(categoryItems.filter((item) => item.sourceMetadata?.addedInCurrentUpgrade).map((item) => item.sourceMetadata?.sourceName).filter(Boolean))) as string[];
    return {
      category,
      beforeCount: beforeCounts[category] ?? 0,
      addedFromNewSources: categoryItems.filter((item) => item.sourceMetadata?.addedInCurrentUpgrade).length,
      removedInvalid: (beforeCounts[category] ?? 0) - (validCounts[category] ?? 0),
      removedExpired: (validCounts[category] ?? 0) - (retainedCounts[category] ?? 0),
      removedDuplicates: (retainedCounts[category] ?? 0) - (finalCounts[category] ?? 0),
      netCount: finalCounts[category] ?? 0,
      newSourceNames,
    };
  });
  const sourceNames = Array.from(new Set(deduped.map((item) => item.sourceMetadata?.sourceName ?? item.sourceName)));
  const newSourceNames = Array.from(new Set(deduped.filter((item) => item.sourceMetadata?.addedInCurrentUpgrade).map((item) => item.sourceMetadata?.sourceName).filter(Boolean))) as string[];

  const report: DailyBriefProcessingReport = {
    beforeCount: items.length,
    addedFromNewSources: deduped.filter((item) => item.sourceMetadata?.addedInCurrentUpgrade).length,
    removedExpired: valid.length - retained.length,
    removedDuplicates: retained.length - deduped.length,
    removedInvalid: items.length - valid.length,
    netCount: deduped.length,
    fetchedAt,
    processedAt: now.toISOString(),
    cacheStatus: options.cacheStatus ?? "miss",
    sourceNames,
    newSourceNames,
    partialFailures: options.partialFailures ?? [],
    categories,
  };

  return { items: deduped, report };
}
