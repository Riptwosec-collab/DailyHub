# DailyHub AI Phase 19-25 Final Pack

This patch completes the remaining production-facing phases.

## Included phases

| Phase | Name | Included |
|---|---|---|
| 19 | Admin / Usage Dashboard | `/admin`, `/admin/usage`, `/admin/logs`, `/admin/errors` |
| 20 | Final QA + Build Fix Toolkit | `npm run qa`, CI workflow, QA checklist |
| 21 | GitHub + Vercel Production Deploy | deploy docs and env checklist |
| 22 | Supabase Production Check | SQL + RLS checklist |
| 23 | Real Data Sources Plan | docs and env plan |
| 24 | Billing / Usage Limit | memory usage events + daily limits |
| 25 | UI Polish + Landing Page | polished `/` and sidebar admin link |

## Install

Copy this patch over your existing DailyHub AI project.

```bash
npm install
cp .env.final.example .env.local
npm run qa
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Test pages

```txt
/
/dashboard
/scheduled-tasks
/task-results
/notifications
/admin
/admin/usage
/admin/logs
/admin/errors
```

## Test APIs

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/admin/metrics
curl http://localhost:3000/api/admin/usage
curl http://localhost:3000/api/admin/errors
```

## Notes

- Usage limits are memory-based in this patch. For production persistence, connect `usage_events` to Supabase using `supabase/schema_phase19_25_usage.sql`.
- Actual GitHub push and Vercel deploy still require your repository URL and production secret values.
- Keep all secrets out of frontend and GitHub.
