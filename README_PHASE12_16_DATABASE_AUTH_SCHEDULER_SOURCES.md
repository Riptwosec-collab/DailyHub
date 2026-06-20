# DailyHub AI Phase 12-16

ชุดนี้อัปเกรด DailyHub AI จาก mock memory ให้พร้อม production มากขึ้น

## Included phases

- Phase 12: Supabase Database Integration
- Phase 13: Auth / Login / Register
- Phase 14: User-specific Tasks
- Phase 15: Scheduler Query from Database
- Phase 16: Data Sources Layer

## Install

```bash
npm install
```

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy env values into `.env.local`.

```env
USE_SUPABASE="true"
ALLOW_MOCK_USER="false"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxx"
SUPABASE_SECRET_KEY="sb_secret_xxx"
```

For local fallback without Supabase:

```env
USE_SUPABASE="false"
ALLOW_MOCK_USER="true"
```

## Auth pages

```txt
/login
/register
/auth/callback
/auth/logout
```

## API routes upgraded

```txt
GET    /api/scheduled-tasks
POST   /api/scheduled-tasks
GET    /api/scheduled-tasks/:id
PATCH  /api/scheduled-tasks/:id
DELETE /api/scheduled-tasks/:id
POST   /api/scheduled-tasks/:id/run-now

GET    /api/task-runs
GET    /api/task-runs/:id
POST   /api/task-runs/:id/regenerate

GET    /api/notifications
PATCH  /api/notifications/:id/read

GET    /api/scheduler/tick
POST   /api/scheduler/tick
GET    /api/health
```

## Data source flags

```env
ENABLE_REAL_DATA_SOURCES="false"
ENABLE_NEWS_SOURCE="false"
NEWS_API_KEY=""
NEWS_QUERY="artificial intelligence OR technology"

ENABLE_WEATHER_SOURCE="false"
WEATHER_LATITUDE="13.7563"
WEATHER_LONGITUDE="100.5018"
WEATHER_LOCATION_NAME="Bangkok"
```

Data sources still have safe mock fallback for Gmail, product prices, football, concert, and weekend ideas.

## Test

```bash
npm run dev
curl http://localhost:3000/api/health
curl http://localhost:3000/api/scheduled-tasks
curl -X POST http://localhost:3000/api/scheduled-tasks/task_001/run-now
curl -X POST http://localhost:3000/api/scheduler/tick -H "Authorization: Bearer change-this-cron-secret"
```

## Notes

- Never expose `SUPABASE_SECRET_KEY`, `OPENAI_API_KEY`, or `TELEGRAM_BOT_TOKEN` to frontend.
- Keep `.env.local` out of GitHub.
- Supabase RLS is included in `supabase/schema.sql`.
- Scheduler uses service/secret key through backend only.
