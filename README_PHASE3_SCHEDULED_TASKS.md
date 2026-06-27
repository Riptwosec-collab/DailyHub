# NimbusDaily AI - Phase 3: Scheduled Tasks Page

Phase 3 เพิ่มหน้า `/scheduled-tasks` สำหรับจัดการ Scheduled Tasks แบบ mock UI

## Features

- Task list
- Filter ตาม Task Type
- Filter ตาม Status
- Search ตามชื่อ task, data source, GPT action
- Status Badge: Active, Paused, Failed, Running
- Last Run / Next Run
- ปุ่ม Run Now แบบ mock
- ปุ่ม View Results
- ปุ่ม Edit
- ปุ่ม Pause / Resume
- ปุ่ม Delete แบบ mock
- Responsive mobile cards + desktop table
- Dark mode neon blue/purple glassmorphism

## Files

```txt
src/app/scheduled-tasks/page.tsx
src/components/tasks/ScheduledTasksView.tsx
src/components/tasks/TaskFilterBar.tsx
src/components/tasks/TaskTable.tsx
src/components/tasks/TaskCard.tsx
src/components/tasks/TaskStatusBadge.tsx
src/components/tasks/PriorityScoreBadge.tsx
```

## Run

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000/scheduled-tasks
```

## Test

1. Search task name เช่น `Daily`
2. Filter status เป็น `Running`
3. Filter task type เป็น `Sale Monitor`
4. กด `Run Now`
5. กด `Pause` แล้วกด `Resume`
6. กด `Delete`

ตอนนี้ทุก action เป็น mock state ฝั่ง client ก่อน Phase 7-8 จะต่อ Mock API Routes และ Run Now endpoint จริง
