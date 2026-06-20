# DailyHub AI - Phase 17: UI ต่อ API จริง

Phase นี้แก้ UI หลักให้เรียก API routes จริงแทนการ import `mock-data.ts` โดยตรง

## สิ่งที่ทำ

- `/dashboard` fetch จาก:
  - `GET /api/scheduled-tasks`
  - `GET /api/task-runs`
  - `GET /api/notifications`
- `/scheduled-tasks` fetch และจัดการ task ผ่าน API:
  - `GET /api/scheduled-tasks`
  - `PATCH /api/scheduled-tasks/:id`
  - `DELETE /api/scheduled-tasks/:id`
  - `POST /api/scheduled-tasks/:id/run-now`
- `/scheduled-tasks/create` submit ผ่าน:
  - `POST /api/scheduled-tasks`
- `/task-results` fetch และ regenerate ผ่าน:
  - `GET /api/task-runs`
  - `POST /api/task-runs/:id/regenerate`
- `/task-results/[id]` fetch detail ผ่าน:
  - `GET /api/task-runs/:id`
  - `GET /api/scheduled-tasks/:id`
- `/notifications` fetch และ mark read ผ่าน:
  - `GET /api/notifications`
  - `PATCH /api/notifications/:id/read`

## ไฟล์ที่เพิ่ม/แก้

```txt
src/lib/api-client.ts

src/app/dashboard/page.tsx
src/components/dashboard/DashboardApiView.tsx

src/app/scheduled-tasks/page.tsx
src/app/scheduled-tasks/create/page.tsx
src/components/tasks/ScheduledTasksApiView.tsx
src/components/tasks/TaskFormApi.tsx
src/components/tasks/TaskStatusBadge.tsx
src/components/tasks/PriorityScoreBadge.tsx

src/app/task-results/page.tsx
src/app/task-results/[id]/page.tsx
src/components/results/TaskResultsApiView.tsx
src/components/results/TaskRunDetailApiView.tsx

src/app/notifications/page.tsx
src/components/notifications/NotificationsApiView.tsx

src/components/ui/LoadingState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/EmptyState.tsx
src/components/ui/Input.tsx
src/components/ui/Card.tsx
src/components/ui/Button.tsx
src/components/ui/Badge.tsx

src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/components/layout/Topbar.tsx

src/types/scheduled-task.ts
src/types/task-run.ts
src/types/notification.ts
src/lib/utils.ts
```

## วิธีใช้

แตก zip แล้ว copy โฟลเดอร์ `src` ไปวางทับโปรเจกต์เดิม

```bash
npm install
npm run dev
```

## หน้าที่ต้องทดสอบ

```txt
/dashboard
/scheduled-tasks
/scheduled-tasks/create
/task-results
/task-results/run_001
/notifications
```

## วิธีทดสอบ flow หลัก

1. เปิด `/scheduled-tasks`
2. กด `Run Now`
3. ระบบจะเรียก `POST /api/scheduled-tasks/:id/run-now`
4. เปิด `/task-results` จะเห็น run ใหม่
5. เปิด `/notifications` จะเห็น notification ใหม่
6. กด `Mark Read` จะเรียก PATCH API
7. เปิด `/dashboard` จะเห็นข้อมูลล่าสุดจาก API

## หมายเหตุ

- ถ้า `USE_SUPABASE=false` API จะยังใช้ mock memory ผ่าน `globalThis.dailyHubMockDb`
- ถ้า `USE_SUPABASE=true` API จะอ่าน/เขียน Supabase ตาม Phase 12–16
- UI ไม่ควร import `mock-data.ts` โดยตรงอีกแล้วหลัง Phase 17
