# Phase 18: Production Error Handling + Logs

Phase 18 เพิ่ม production hardening ให้ DailyHub AI หลังจาก UI ต่อ API จริงแล้วใน Phase 17

## สิ่งที่เพิ่ม

- API response format กลาง
- AppError class + error code มาตรฐาน
- Server logger พร้อม redact secret
- Audit logs แบบ mock memory
- SQL สำหรับ audit_logs บน Supabase
- Rate limit สำหรับ Run Now / Regenerate / Retry
- Retry failed task endpoint
- Toast notification UI
- AsyncButton สำหรับ loading ต่อปุ่ม
- ErrorState / EmptyState ที่ดีขึ้น
- Health check ที่แสดง hardening status

## ไฟล์หลัก

```txt
src/lib/api/errors.ts
src/lib/api/response.ts
src/lib/api/validation.ts
src/lib/logger.ts
src/lib/rate-limit.ts
src/lib/api-client.ts

src/types/audit-log.ts
src/lib/repositories/audit-logs.repository.ts
src/services/audit-log.service.ts

src/app/api/audit-logs/route.ts
src/app/api/scheduled-tasks/[id]/run-now/route.ts
src/app/api/task-runs/[id]/regenerate/route.ts
src/app/api/task-runs/[id]/retry/route.ts
src/app/api/health/route.ts

src/components/ui/ToastProvider.tsx
src/components/ui/AsyncButton.tsx
src/components/ui/ApiStatusBanner.tsx
src/components/ui/ErrorState.tsx
src/components/ui/EmptyState.tsx
src/components/layout/AppShell.tsx

supabase/schema_phase18_audit_logs.sql
```

## วิธีใช้

แตก zip แล้ว copy ไฟล์ไปวางทับโปรเจกต์เดิม จากนั้นรัน:

```bash
npm install
npm run dev
```

เปิดเช็ก:

```txt
http://localhost:3000/api/health
```

## ทดสอบ Run Now rate limit + audit log

```bash
curl -X POST http://localhost:3000/api/scheduled-tasks/task_001/run-now
```

เช็ก audit logs:

```bash
curl http://localhost:3000/api/audit-logs
```

## ทดสอบ Retry failed task

```bash
curl -X POST http://localhost:3000/api/task-runs/run_005/retry
```

## ทดสอบ Regenerate

```bash
curl -X POST http://localhost:3000/api/task-runs/run_001/regenerate
```

## API Error Format ใหม่

Success:

```json
{
  "success": true,
  "data": {},
  "requestId": "req_xxx"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "requestId": "req_xxx"
  }
}
```

## Supabase Audit Logs

ถ้าต้องการเก็บ audit logs ใน Supabase จริง ให้รัน:

```txt
supabase/schema_phase18_audit_logs.sql
```

หมายเหตุ: patch นี้ยังใช้ audit logs แบบ memory เพื่อไม่ชนกับ repository Supabase เดิม ถ้าจะ production เต็ม ให้ต่อ `audit-logs.repository.ts` เข้ากับ Supabase table `audit_logs`

## Security Notes

- logger จะ redact key ที่มีคำว่า token, api_key, password, secret, authorization
- Run Now มี rate limit 5 ครั้งต่อนาทีต่อ IP + task
- Regenerate มี rate limit 8 ครั้งต่อนาทีต่อ IP + run
- Retry มี rate limit 5 ครั้งต่อนาทีต่อ IP + run
- Error 500 จะไม่ส่ง internal details กลับ frontend

## ขั้นต่อไป

แนะนำทำต่อ:

```txt
Phase 19: Admin / Usage Dashboard
```

ควรแสดง:

- จำนวน task runs ต่อวัน
- จำนวน OpenAI calls
- Telegram sent/failed
- Failed task trend
- Audit logs table
- Rate limit events
- ค่าใช้จ่ายโดยประมาณ
