import assert from "node:assert/strict";
import test from "node:test";
import { processDailyBriefItems } from "../src/services/news-processing.service.ts";
import type { DailyBriefItem } from "../src/types/daily-brief.ts";

const now = new Date("2026-07-15T05:00:00.000Z");

function item(id: string, overrides: Partial<DailyBriefItem> = {}): DailyBriefItem {
  return {
    id,
    title: `Story ${id}`,
    titleTh: `Story ${id}`,
    summaryTh: "Summary",
    bulletPoints: [],
    whyItMatters: "Context",
    impact: "Impact",
    category: "world",
    tags: ["world"],
    sourceName: "Source A",
    sourceUrl: `https://example.com/${id}`,
    publishedAt: "2026-07-15T04:00:00.000Z",
    fetchedAt: "2026-07-15T04:05:00.000Z",
    language: "en",
    priorityScore: 80,
    relatedSources: [],
    rawDescription: "Description",
    isSaved: false,
    isHidden: false,
    telegramStatus: "idle",
    ...overrides,
  };
}

test("reports expired, duplicate, invalid, new-source, and net counts", () => {
  const result = processDailyBriefItems([
    item("primary", { sourceMetadata: { sourceId: "new", sourceName: "New Feed", addedInCurrentUpgrade: true, fetchedAt: now.toISOString() } }),
    item("duplicate", { title: "Story primary", titleTh: "Story primary", sourceUrl: "https://example.com/primary?utm_source=test" }),
    item("expired", { publishedAt: "2026-07-12T04:00:00.000Z" }),
    item("invalid", { sourceUrl: "not-a-url" }),
  ], { now, fetchedAt: now.toISOString() });

  assert.equal(result.report.beforeCount, 4);
  assert.equal(result.report.removedExpired, 1);
  assert.equal(result.report.removedDuplicates, 1);
  assert.equal(result.report.removedInvalid, 1);
  assert.equal(result.report.addedFromNewSources, 1);
  assert.equal(result.report.netCount, 1);
  assert.equal(result.items[0].relatedSources.length, 1);
});

test("rejects promotional spam disguised as a news headline", () => {
  const result = processDailyBriefItems([
    item("news"),
    item("spam", {
      title: "ผล บอล หน่อย คาสิโนออนไลน์ พร้อมโปรโมชั่น ชนะรางวัลทุกวัน",
      titleTh: "ผล บอล หน่อย คาสิโนออนไลน์ พร้อมโปรโมชั่น ชนะรางวัลทุกวัน",
    }),
  ], { now, fetchedAt: now.toISOString() });

  assert.equal(result.report.removedInvalid, 1);
  assert.deepEqual(result.items.map((entry) => entry.id), ["news"]);
});
