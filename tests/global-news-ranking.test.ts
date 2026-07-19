import assert from "node:assert/strict";
import test from "node:test";
import { rankGlobalTopStories, scoreGlobalStory } from "../src/services/global-news-ranking.service.ts";
import type { DailyBriefItem } from "../src/types/daily-brief.ts";

const now = new Date("2026-07-15T05:00:00.000Z");

function story(id: string, overrides: Partial<DailyBriefItem> = {}): DailyBriefItem {
  return {
    id,
    title: id,
    titleTh: id,
    summaryTh: "Summary",
    bulletPoints: [],
    whyItMatters: "Context",
    impact: "Impact",
    category: "world",
    tags: ["world"],
    sourceName: "Source",
    sourceUrl: `https://example.com/${id}`,
    publishedAt: "2026-07-15T04:00:00.000Z",
    language: "en",
    priorityScore: 70,
    relatedSources: [],
    rawDescription: "Description",
    isSaved: false,
    isHidden: false,
    telegramStatus: "idle",
    ...overrides,
  };
}

test("global ranking rewards source priority, recency, and cross-source mentions", () => {
  const strong = story("strong", {
    sourceMetadata: { sourceId: "trusted", sourceName: "Trusted", addedInCurrentUpgrade: true, fetchedAt: now.toISOString(), priority: 90 },
    relatedSources: [{ name: "Second", url: "https://second.example/story", publishedAt: "2026-07-15T03:55:00.000Z" }],
  });
  const weak = story("weak", { publishedAt: "2026-07-14T06:00:00.000Z", priorityScore: 45 });

  assert.ok(scoreGlobalStory(strong, now) > scoreGlobalStory(weak, now));
  assert.equal(rankGlobalTopStories([weak, strong], 1, now)[0].id, "strong");
});

test("global ranking excludes unrelated dashboard categories", () => {
  const result = rankGlobalTopStories([story("task", { category: "todayTasks" }), story("world")], 6, now);
  assert.deepEqual(result.map((item) => item.id), ["world"]);
});
