# Real Data Sources Plan

Phase 16 added hybrid data source services. For production, enable only the sources you need.

## News

```env
ENABLE_REAL_DATA_SOURCES="true"
ENABLE_NEWS_SOURCE="true"
NEWS_API_KEY="..."
NEWS_QUERY="artificial intelligence OR technology"
```

## Weather

```env
ENABLE_REAL_DATA_SOURCES="true"
ENABLE_WEATHER_SOURCE="true"
WEATHER_LATITUDE="13.7563"
WEATHER_LONGITUDE="100.5018"
WEATHER_LOCATION_NAME="Bangkok"
```

## Gmail

Gmail still needs OAuth. Recommended next implementation:

- Google OAuth consent screen
- Gmail readonly scope
- Store refresh token encrypted server-side
- Fetch recent important email summaries through backend only

## Product Prices / Football / Concert

Keep mock until a stable API provider is chosen.
