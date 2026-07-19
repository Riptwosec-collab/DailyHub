import assert from "node:assert/strict";
import test from "node:test";
import { isScheduledItemActive } from "../src/lib/event-date.ts";

const bangkokMorning = (isoDay: string) => new Date(`${isoDay}T02:00:00.000Z`);

test("removes concerts and events the day after their final date", () => {
  assert.equal(isScheduledItemActive("Jul 15, 2026", bangkokMorning("2026-07-15"), "concert"), true);
  assert.equal(isScheduledItemActive("Jul 15, 2026", bangkokMorning("2026-07-16"), "concert"), false);
  assert.equal(isScheduledItemActive("2026-07-15", bangkokMorning("2026-07-16"), "event"), false);
});

test("uses the final day for same-month and cross-month ranges", () => {
  assert.equal(isScheduledItemActive("Jul 11-19, 2026", bangkokMorning("2026-07-18")), true);
  assert.equal(isScheduledItemActive("Sep 5-Oct 17, 2026", bangkokMorning("2026-10-18")), false);
});

test("keeps cinema releases for one calendar month", () => {
  assert.equal(isScheduledItemActive("Jul 17, 2026", bangkokMorning("2026-08-17"), "cinema"), true);
  assert.equal(isScheduledItemActive("Jul 17, 2026", bangkokMorning("2026-08-18"), "cinema"), false);
});

test("keeps Netflix and streaming releases for four calendar months", () => {
  assert.equal(isScheduledItemActive("Jul 17, 2026", bangkokMorning("2026-11-17"), "streaming"), true);
  assert.equal(isScheduledItemActive("Jul 17, 2026", bangkokMorning("2026-11-18"), "streaming"), false);
});

test("clamps calendar-month retention at the end of shorter months", () => {
  assert.equal(isScheduledItemActive("Jan 31, 2026", bangkokMorning("2026-02-28"), "cinema"), true);
  assert.equal(isScheduledItemActive("Jan 31, 2026", bangkokMorning("2026-03-01"), "cinema"), false);
});

test("keeps TBA records until a real date is available", () => {
  assert.equal(isScheduledItemActive("TBA", bangkokMorning("2027-01-01"), "event"), true);
});
