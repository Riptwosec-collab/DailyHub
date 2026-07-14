import assert from "node:assert/strict";
import test from "node:test";
import { isNewsWithinRetention, parseNewsTimestamp } from "../src/lib/news-retention.ts";

const now = new Date("2026-01-01T12:00:00.000Z");

test("keeps news younger than 48 hours", () => {
  assert.equal(isNewsWithinRetention("2025-12-30T12:00:01.000Z", now, 48), true);
});

test("expires news at exactly 48 hours", () => {
  assert.equal(isNewsWithinRetention("2025-12-30T12:00:00.000Z", now, 48), false);
});

test("expires news older than 48 hours", () => {
  assert.equal(isNewsWithinRetention("2025-12-29T12:00:00.000Z", now, 48), false);
});

test("handles day, month, and year boundaries with timestamps", () => {
  assert.equal(isNewsWithinRetention("2025-12-31T23:59:00+07:00", now, 48), true);
  assert.equal(isNewsWithinRetention("2025-11-30T23:59:00+07:00", now, 48), false);
});

test("falls back to fetchedAt and labels the timestamp kind", () => {
  assert.deepEqual(parseNewsTimestamp(undefined, "2026-01-01T10:00:00.000Z")?.kind, "fetched");
  assert.equal(isNewsWithinRetention(undefined, now, 48, "2026-01-01T10:00:00.000Z"), true);
});

test("rejects invalid and future timestamps", () => {
  assert.equal(isNewsWithinRetention("invalid", now, 48), false);
  assert.equal(isNewsWithinRetention("2026-01-01T12:00:01.000Z", now, 48), false);
});
