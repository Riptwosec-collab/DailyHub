# Dashboard and Live Data Upgrade

Verification date: 2026-07-15 (Asia/Bangkok)

## Audit and root causes

- The old dashboard rendered full Daily, scheduled-task, run-result, and notification experiences together. This duplicated destination routes and made the first screen long and dense.
- News retention existed only as a presentation filter with a three-day window. The service cache still held expired records and the API did not report validation, retention, or deduplication results.
- Sidebar update timestamps were hardcoded. Stock API response time was also being presented as source update time.
- The stock page compared live responses with bundled sample prices during initial load, marked many rows as changed, and replaced the successful timestamp before a request completed. These transitions retriggered row effects and looked like a full-page flash.
- News requests used `no-store` without a shared service cache. Refetches could replace useful content with a full loading state.
- Source failures were isolated in parts of the pipeline, but source IDs, priorities, cache policies, and new-source attribution were not centralized.

## Implementation

- Replaced the dashboard body with compact summary, Global Top Stories, market, route shortcuts, and a collapsible merge report. Existing destination routes remain available.
- Added a 48-hour UTC retention policy with `fetchedAt` fallback, validation, cache cleanup, canonical URL/title deduplication, and per-category reporting.
- Added Global Top Stories ranking from recency, source priority, related-source count, category relevance, and existing priority score.
- Added `DataFreshnessIndicator` and separate thresholds for stocks, news, daily data, and events. Display selection is `sourceUpdatedAt`, then `sourcePublishedAt`, then `fetchedAt`, formatted in Asia/Bangkok.
- Preserved the last successful news and stock snapshot during refetch. Stock change effects are now applied only to rows whose quote values changed after an explicit refresh.
- Added a data source registry and source metadata on every fetched news item. Source failures produce partial data instead of failing the entire response.
- Added spam-quality validation for promotional gambling headlines that arrive through public aggregators.

## Data sources

| Topic | Existing source | New source | Priority | Cache TTL | Fallback |
| --- | --- | --- | ---: | ---: | --- |
| Daily news | NewsData.io Latest, Google News Thailand RSS | Google News Global RSS | 78 | 5 minutes | Stale successful cache |
| Global Top Stories | Existing world/market/technology news | Google News Global RSS | 78 | 5 minutes | Ranked retained daily news |
| Stock quotes and indices | Yahoo Finance Quote | None added | 90 | 30 seconds | Yahoo Finance Chart, then last successful snapshot |
| Watchlist and company prices | Yahoo Finance Quote | None added | 90 | 30 seconds | Yahoo Finance Chart, then last successful snapshot |

No unlicensed page scraping was added. Stock quote and chart endpoints are registered separately so attribution, source time, priority, and fallback behavior remain observable.

## Live merge report sample

This sample is from a forced refresh on 2026-07-15. Counts are expected to change with each source response.

| Metric | Count |
| --- | ---: |
| Records before processing | 156 |
| Added from Google News Global RSS | 10 |
| Removed because older than 48 hours | 79 |
| Removed as duplicates | 0 |
| Removed as invalid or promotional spam | 7 |
| Net records | 70 |

The API returns the same fields for every real news category in `processingReport.categories`: `beforeCount`, `addedFromNewSources`, `removedExpired`, `removedDuplicates`, `removedInvalid`, `netCount`, and `newSourceNames`. Records from the new feed carry `sourceMetadata.addedInCurrentUpgrade = true`.

## Cache and failure policy

- Daily news and global feed: five-minute in-memory cache. A forced refresh bypasses the cache. Expired records are removed before the successful cache is rewritten.
- Stock quotes: 30-second in-memory cache. Explicit refresh bypasses the cache; failed refreshes preserve the last successful client snapshot.
- RSS sources run independently. One rejected source is reported in `partialFailures` while successful sources continue through validation and ranking.
- Yahoo Quote is primary and Yahoo Chart is a bounded-concurrency fallback. Source timestamps are kept separately from fetch timestamps.

## Verification

- TypeScript type check passed.
- ESLint passed with only pre-existing warnings in unrelated legacy files.
- Sixteen unit tests passed for retention boundaries, invalid/future dates, Bangkok formatting, freshness thresholds, processing counts, spam validation, stable source IDs, ranking, and source registry behavior.
- Browser checks passed for dashboard loading, partial-section isolation, no desktop horizontal overflow, persisted collapse state, Global Top Stories, semantic source timestamps, preserved content during refresh, and zero initial stock change animations.
- Production build passed.
