# DailyHub AI - Phase 8: Run Now Mock Flow

Phase 8 เพิ่มระบบ Run Now จำลองผ่าน API จริงของ Next.js Route Handler

## สิ่งที่เพิ่ม

- `POST /api/scheduled-tasks/[id]/run-now`
- `POST /api/task-runs/[id]/regenerate`
- `task-runner.service.ts`
- `openai.service.ts` แบบ mock GPT output
- `notification.service.ts`
- `telegram.service.ts` แบบ mock Telegram status
- ปรับ `ScheduledTasksView.tsx` ให้ปุ่ม Run Now เรียก API จริง

## Flow

```txt
กด Run Now
→ POST /api/scheduled-tasks/:id/run-now
→ task-runner.service.ts
→ build raw input mock
→ build GPT prompt mock
→ generate GPT output mock
→ create task_runs
→ create web_notifications ถ้าเปิด Save to Notifications
→ set telegram_status เป็น mock_sent / skipped / not_enabled
→ update last_run_at / next_run_at
→ ส่งผลกลับ frontend
```

## วิธีทดสอบ

```bash
npm install
npm run dev
```

เปิดหน้า:

```txt
http://localhost:3000/scheduled-tasks
```

กดปุ่ม `Run Now` ที่ task ใดก็ได้

หรือทดสอบด้วย curl:

```bash
curl -X POST http://localhost:3000/api/scheduled-tasks/task_001/run-now
```

ตรวจ task runs:

```bash
curl http://localhost:3000/api/task-runs
```

ตรวจ notifications:

```bash
curl http://localhost:3000/api/notifications
```

ทดสอบ regenerate:

```bash
curl -X POST http://localhost:3000/api/task-runs/run_001/regenerate
```

## หมายเหตุ

ยังเป็น mock backend ผ่าน `globalThis.dailyHubMockDb` ก่อน ข้อมูลจะ reset เมื่อ dev server restart

Phase ถัดไปคือ Phase 9: ต่อ OpenAI API จริง
