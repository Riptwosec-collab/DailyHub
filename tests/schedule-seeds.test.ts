import assert from "node:assert/strict";
import test from "node:test";
import { concertSeeds, eventSeeds, formatSeedDateRange, isSafeScheduleSourceUrl } from "../src/data/schedule-seeds.ts";

test("imports every attached concert and event record", () => {
  assert.equal(concertSeeds.length, 87);
  assert.equal(eventSeeds.length, 52);
  assert.equal(new Set(concertSeeds.map((item) => item.id)).size, concertSeeds.length);
  assert.equal(new Set(eventSeeds.map((item) => item.id)).size, eventSeeds.length);
});

test("every schedule record has a usable source link", () => {
  assert.equal(concertSeeds.every((item) => isSafeScheduleSourceUrl(item.sourceUrl)), true);
  assert.equal(eventSeeds.every((item) => isSafeScheduleSourceUrl(item.sourceUrl)), true);
});

test("formats single-day and cross-month date ranges", () => {
  assert.equal(formatSeedDateRange("2026-07-17", "2026-07-17", "en"), "Jul 17, 2026");
  assert.equal(formatSeedDateRange("2026-07-31", "2026-08-02", "en"), "Jul 31-Aug 2, 2026");
  assert.equal(formatSeedDateRange("2026-07-17", "2026-07-19", "th"), "17-19 ก.ค. 2569");
});
