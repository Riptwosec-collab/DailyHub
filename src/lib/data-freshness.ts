import type { DataFreshness, DataFreshnessStatus } from "../types/data-freshness.ts";

export type FreshnessKind = "stock" | "news" | "daily" | "event";

const thresholds: Record<FreshnessKind, { liveMs: number; freshMs: number; delayedMs: number }> = {
  stock: { liveMs: 2 * 60_000, freshMs: 15 * 60_000, delayedMs: 90 * 60_000 },
  news: { liveMs: 10 * 60_000, freshMs: 6 * 60 * 60_000, delayedMs: 24 * 60 * 60_000 },
  daily: { liveMs: 30 * 60_000, freshMs: 24 * 60 * 60_000, delayedMs: 48 * 60 * 60_000 },
  event: { liveMs: 60 * 60_000, freshMs: 12 * 60 * 60_000, delayedMs: 48 * 60 * 60_000 },
};

export function selectFreshnessTimestamp(freshness: Partial<DataFreshness>) {
  const candidates = [
    { value: freshness.sourceUpdatedAt, label: "sourceUpdatedAt" as const },
    { value: freshness.sourcePublishedAt, label: "sourcePublishedAt" as const },
    { value: freshness.fetchedAt, label: "fetchedAt" as const },
  ];

  for (const candidate of candidates) {
    if (!candidate.value) continue;
    const time = new Date(candidate.value).getTime();
    if (Number.isFinite(time)) return { ...candidate, time };
  }
  return null;
}

export function getDataFreshnessStatus(kind: FreshnessKind, freshness: Partial<DataFreshness>, now = new Date()): DataFreshnessStatus {
  const selected = selectFreshnessTimestamp(freshness);
  if (!selected || !Number.isFinite(now.getTime())) return "unavailable";
  const ageMs = Math.max(0, now.getTime() - selected.time);
  const threshold = thresholds[kind];
  if (ageMs <= threshold.liveMs) return "live";
  if (ageMs <= threshold.freshMs) return "fresh";
  if (ageMs <= threshold.delayedMs) return "delayed";
  return "stale";
}

export function formatBangkokDateTime(value: string, locale: "th" | "en" = "th") {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return locale === "th" ? "ไม่พร้อมใช้งาน" : "Unavailable";
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}
