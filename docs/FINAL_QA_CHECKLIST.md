# DailyHub AI Final QA Checklist

## Local checks

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Pages to verify

- `/`
- `/dashboard`
- `/scheduled-tasks`
- `/scheduled-tasks/create`
- `/task-results`
- `/notifications`
- `/admin`
- `/admin/usage`
- `/admin/logs`
- `/admin/errors`

## API checks

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/admin/metrics
curl http://localhost:3000/api/admin/usage
curl http://localhost:3000/api/admin/errors
curl http://localhost:3000/api/scheduled-tasks
curl http://localhost:3000/api/task-runs
curl http://localhost:3000/api/notifications
```

## Production checks

- Confirm all secrets are in Vercel Environment Variables.
- Confirm `.env.local` is not committed.
- Confirm Supabase RLS is enabled.
- Confirm Vercel Cron calls `/api/scheduler/tick`.
- Confirm Telegram test sends a message.
- Confirm OpenAI test returns JSON output.
