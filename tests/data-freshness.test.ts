import assert from "node:assert/strict";
import test from "node:test";
import { formatBangkokDateTime, getDataFreshnessStatus, selectFreshnessTimestamp } from "../src/lib/data-freshness.ts";

const now = new Date("2026-07-15T05:00:00.000Z");

test("uses sourceUpdatedAt before sourcePublishedAt and fetchedAt", () => {
  const selected = selectFreshnessTimestamp({
    sourceUpdatedAt: "2026-07-15T04:58:00.000Z",
    sourcePublishedAt: "2026-07-15T04:59:00.000Z",
    fetchedAt: "2026-07-15T05:00:00.000Z",
  });
  assert.equal(selected?.label, "sourceUpdatedAt");
  assert.equal(selected?.value, "2026-07-15T04:58:00.000Z");
});

test("applies data-type-specific freshness thresholds", () => {
  const freshness = { fetchedAt: "2026-07-15T04:50:00.000Z" };
  assert.equal(getDataFreshnessStatus("stock", freshness, now), "fresh");
  assert.equal(getDataFreshnessStatus("news", freshness, now), "live");
  assert.equal(getDataFreshnessStatus("stock", { fetchedAt: "2026-07-15T02:00:00.000Z" }, now), "stale");
  assert.equal(getDataFreshnessStatus("news", {}, now), "unavailable");
});

test("formats Bangkok time with Buddhist year in Thai", () => {
  assert.match(formatBangkokDateTime("2026-07-15T05:00:00.000Z", "th"), /2569/);
});
