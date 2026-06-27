# NimbusDaily AI Phase 19-25 Final Pack

This patch completes the remaining production-facing phases.

## Included phases

| Phase | Name | Included |
|---|---|---|
| 19 | Admin / Usage Dashboard | `/admin`, `/admin/usage`, `/admin/logs`, `/admin/errors` |
| 20 | Final QA + Build Fix Toolkit | `npm run qa`, CI workflow, QA checklist |
| 21 | GitHub + Vercel Production Deploy | deploy docs and env checklist |
| 22 | Supabase Production Check | SQL + RLS checklist |
| 23 | Real Data Sources Plan | docs and env plan |
| 24 | Billing / Usage Limit | persistent Supabase usage events + daily limits |
| 25 | UI Polish + Landing Page | polished `/` and sidebar admin link |

## Install

Copy this patch over your existing NimbusDaily AI project.

```bash
npm install
cp .env.final.example .env.local
npm run qa
npm run typecheck
npm run lint
npm run build
npm run dev
```

For production Supabase persistence, run these SQL files in order:

```txt
supabase/schema.sql
supabase/schema_phase18_audit_logs.sql
supabase/schema_phase19_25_usage.sql
supabase/schema_phase28_settings_templates.sql
supabase/schema_phase29_rate_limits.sql
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
curl -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/api/admin/metrics
curl -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/api/admin/usage
curl -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3000/api/admin/errors
```

## Notes

- Usage, audit logs, and rate limit events persist to Supabase when `USE_SUPABASE=true`; local/mock mode still uses bounded memory stores.
- Admin pages require an authenticated admin user from `ADMIN_EMAILS` or `ADMIN_USER_IDS`. Admin APIs also accept `x-admin-secret` when `ADMIN_SECRET` is configured.
- Scheduled jobs are expected to run from GitHub Actions with `CRON_URL` and `CRON_SECRET`; `vercel.json` no longer defines a second cron to avoid duplicate runs.
- Actual GitHub push and Vercel deploy still require your repository URL and production secret values.
- Keep all secrets out of frontend and GitHub.
