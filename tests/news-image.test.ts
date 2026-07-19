import assert from "node:assert/strict";
import test from "node:test";
import { hasUsableNewsImage } from "../src/lib/news-image.ts";

test("accepts a real remote news image", () => {
  assert.equal(hasUsableNewsImage({ imageUrl: "https://cdn.example.com/news/story-1.webp" }), true);
});

test("rejects publisher homepages used as image fallbacks", () => {
  assert.equal(hasUsableNewsImage({ imageUrl: "https://www.thaipublica.org/" }), false);
});

test("rejects a related source page reused as an image", () => {
  const sourceUrl = "https://publisher.example.com/story/42";
  assert.equal(hasUsableNewsImage({ imageUrl: sourceUrl, relatedSources: [{ url: sourceUrl }] }), false);
});

test("rejects missing, invalid, and placeholder image URLs", () => {
  assert.equal(hasUsableNewsImage({}), false);
  assert.equal(hasUsableNewsImage({ imageUrl: "not-a-url" }), false);
  assert.equal(hasUsableNewsImage({ imageUrl: "https://example.com/placeholder.jpg" }), false);
});
