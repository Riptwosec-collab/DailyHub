import assert from "node:assert/strict";
import test from "node:test";
import { dataSourceRegistry, getDataSourceDefinition } from "../src/lib/data-source-registry.ts";
import { buildGoogleNewsItemId } from "../src/lib/news-item-id.ts";

test("registers the new global feed with attribution and cache policy", () => {
  const source = getDataSourceDefinition("google-news-global-rss");

  assert.equal(source?.name, "Google News Global RSS");
  assert.equal(source?.isNew, true);
  assert.equal(source?.enabled, true);
  assert.ok((source?.cacheTtlMs ?? 0) > 0);
  assert.ok((source?.priority ?? 0) > 0);
});

test("keeps stock primary and fallback sources separately identifiable", () => {
  assert.notEqual(dataSourceRegistry.yahooQuote.id, dataSourceRegistry.yahooChart.id);
  assert.ok(dataSourceRegistry.yahooQuote.priority > dataSourceRegistry.yahooChart.priority);
});

test("builds stable, source-specific news record IDs", () => {
  const link = "https://news.google.com/rss/articles/example?oc=5";
  const thaiId = buildGoogleNewsItemId("google-news-th-rss", "world", link);
  const globalId = buildGoogleNewsItemId("google-news-global-rss", "world", link);

  assert.notEqual(thaiId, globalId);
  assert.equal(thaiId, buildGoogleNewsItemId("google-news-th-rss", "world", link));
});
