# Phase 27: Settings Page + Task Templates

Phase 27 เพิ่มหน้า Settings และ Task Templates เพื่อให้ DailyHub AI ใช้งานง่ายขึ้นก่อนต่อ production integrations จริง

## สิ่งที่เพิ่ม

```txt
/settings
/templates
GET /api/settings
PATCH /api/settings
GET /api/task-templates
POST /api/task-templates/:id/create-task
```

## Settings Page

หน้า `/settings` ใช้ตั้งค่าเบื้องต้นของระบบ:

- OpenAI Mode: Mock / Real
- Telegram Mode: Off / On
- Scheduler Mode: Manual / Vercel Daily Cron / External Scheduler
- Default Timezone
- Default Min Priority Score
- Data Source toggles
- Production checklist

หมายเหตุ: Settings ใน Phase นี้ยังเป็น memory-based เพื่อให้ deploy และ demo ได้ทันที ถ้าต้องการ production persistence ให้เพิ่ม table `user_settings` ใน Supabase ภายหลัง

## Task Templates Page

หน้า `/templates` มี template สำเร็จรูปให้กดสร้าง Scheduled Task ได้ทันที:

- Morning Daily Brief
- Important Email Monitor
- Sale Monitor
- Weather Morning Update
- Football Daily Recap
- Weekend Ideas Generator
- Concert Alerts
- Custom AI Task

เมื่อกด `Use Template` ระบบจะเรียก:

```txt
POST /api/task-templates/:id/create-task
```

แล้วสร้าง task ผ่าน repository เดิม จึงรองรับทั้งโหมด mock และ Supabase ตามค่า `USE_SUPABASE`

## วิธีทดสอบ

```bash
npm run build
npm run dev
```

เปิดหน้า:

```txt
/settings
/templates
/api/settings
/api/task-templates
```

ทดสอบ flow:

1. เปิด `/templates`
2. กด `Use Template`
3. ไป `/scheduled-tasks`
4. เห็น task ใหม่
5. กด `Run Now`
6. ไป `/task-results` และ `/notifications`

## Next Phase แนะนำ

```txt
Phase 28: Supabase User Settings + Task Templates Persistence
Phase 29: OpenAI/Telegram Production Toggle Validation
Phase 30: External Scheduler Setup
```
