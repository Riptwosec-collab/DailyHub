# NimbusDaily AI - Phase 7: Mock API Routes

Phase 7 adds mock backend API routes for Scheduled Tasks, Task Runs, and Notifications.

## Added files

```txt
src/lib/mock-db.ts
src/app/api/scheduled-tasks/route.ts
src/app/api/scheduled-tasks/[id]/route.ts
src/app/api/task-runs/route.ts
src/app/api/task-runs/[id]/route.ts
src/app/api/notifications/route.ts
src/app/api/notifications/[id]/read/route.ts
```

## Test commands

```bash
curl http://localhost:3000/api/scheduled-tasks
curl http://localhost:3000/api/task-runs
curl http://localhost:3000/api/notifications
curl http://localhost:3000/api/scheduled-tasks/task_001
curl http://localhost:3000/api/task-runs/run_001
curl -X PATCH http://localhost:3000/api/notifications/noti_001/read -H "Content-Type: application/json" -d '{"isRead":true}'
```

## Notes

- Data is stored in memory through `globalThis.nimbusDailyMockDb`.
- This is for development/mock mode only.
- Run Now is intentionally left for Phase 8.
