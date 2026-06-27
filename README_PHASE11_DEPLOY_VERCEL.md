# Phase 11: Deploy Vercel

Phase 11 คือขั้นตอนเตรียมโปรเจกต์ NimbusDaily AI สำหรับ deploy ขึ้น Vercel พร้อม endpoint สำหรับ Vercel Cron เรียก Scheduler Tick

## สิ่งที่เพิ่มใน Phase นี้

- `vercel.json`
- `/api/scheduler/tick`
- `/api/health`
- `scheduler.service.ts`
- `.env.example` เวอร์ชัน production checklist
- ขั้นตอน deploy ผ่าน GitHub และ Vercel CLI

---

## ไฟล์ที่ต้องเพิ่ม/แก้

```txt
vercel.json
.env.example
src/services/scheduler.service.ts
src/app/api/scheduler/tick/route.ts
src/app/api/health/route.ts
```

---

## 1. vercel.json

Vercel Cron จะเรียก endpoint นี้ทุก 1 นาที

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/scheduler/tick",
      "schedule": "* * * * *"
    }
  ]
}
```

> หมายเหตุ: Cron schedule ของ Vercel ใช้เวลาแบบ UTC แต่ในโปรเจกต์นี้ให้เก็บ `nextRunAt` เป็น ISO timestamp แล้ว scheduler เช็ก `nextRunAt <= now` จึงใช้งานกับ timezone ได้ง่ายกว่า

---

## 2. Environment Variables บน Vercel

ไปที่:

```txt
Vercel Dashboard
→ Project
→ Settings
→ Environment Variables
```

ใส่ค่าต่อไปนี้:

```env
NEXT_PUBLIC_APP_NAME="NimbusDaily AI"
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
APP_TIMEZONE="Asia/Bangkok"

OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.5"
OPENAI_BASE_URL="https://api.openai.com/v1"
ENABLE_OPENAI="true"
OPENAI_FALLBACK_TO_MOCK="true"

TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
TELEGRAM_BASE_URL="https://api.telegram.org"
ENABLE_TELEGRAM="true"
TELEGRAM_FALLBACK_TO_MOCK="true"

USE_MOCK_DATA="true"
ENABLE_SCHEDULER="true"

CRON_SECRET="generate-a-long-random-secret"
SCHEDULER_SECRET="generate-a-long-random-secret"
```

สำคัญ:

- ห้ามใช้ `NEXT_PUBLIC_` กับ `OPENAI_API_KEY`
- ห้ามใช้ `NEXT_PUBLIC_` กับ `TELEGRAM_BOT_TOKEN`
- ห้าม commit `.env.local` ขึ้น GitHub
- Production จริงควรใช้ Database แทน mock memory

---

## 3. ทดสอบ Local ก่อน Deploy

ติดตั้ง dependency:

```bash
npm install
```

สร้าง `.env.local`:

```bash
cp .env.example .env.local
```

Build test:

```bash
npm run build
```

Run dev:

```bash
npm run dev
```

เปิด health check:

```txt
http://localhost:3000/api/health
```

ทดสอบ scheduler tick แบบ manual:

```bash
curl -X POST http://localhost:3000/api/scheduler/tick \
  -H "Authorization: Bearer change-this-cron-secret"
```

หรือใช้ header สำรอง:

```bash
curl -X POST http://localhost:3000/api/scheduler/tick \
  -H "x-scheduler-secret: change-this-scheduler-secret"
```

---

## 4. Deploy ด้วย GitHub + Vercel Dashboard

1. Push code ขึ้น GitHub
2. เข้า Vercel Dashboard
3. กด `Add New Project`
4. Import repository `nimbusdaily-ai`
5. Framework Preset: `Next.js`
6. Build Command: `npm run build`
7. Output Directory: ไม่ต้องใส่ ให้ Vercel auto detect
8. เพิ่ม Environment Variables ทั้งหมด
9. กด Deploy

หลัง deploy ให้เปิด:

```txt
https://your-project.vercel.app
https://your-project.vercel.app/dashboard
https://your-project.vercel.app/scheduled-tasks
https://your-project.vercel.app/task-results
https://your-project.vercel.app/notifications
https://your-project.vercel.app/api/health
```

---

## 5. Deploy ด้วย Vercel CLI

ติดตั้ง Vercel CLI:

```bash
npm i -g vercel
```

Login:

```bash
vercel login
```

Link project:

```bash
vercel link
```

Deploy preview:

```bash
vercel
```

Deploy production:

```bash
vercel deploy --prod
```

---

## 6. เช็ก Cron บน Vercel

หลัง deploy production แล้ว Vercel จะอ่าน `vercel.json` และสร้าง cron job ให้

เช็กใน Dashboard:

```txt
Vercel Project
→ Settings
→ Cron Jobs
```

หรือใช้ CLI:

```bash
vercel crons ls
```

Trigger ทดสอบด้วย CLI:

```bash
vercel crons run /api/scheduler/tick
```

---

## 7. Endpoint ที่เพิ่ม

### Health Check

```txt
GET /api/health
```

ใช้เช็กว่า environment, OpenAI mode, Telegram mode และ scheduler config พร้อมไหม

### Scheduler Tick

```txt
GET  /api/scheduler/tick
POST /api/scheduler/tick
```

รองรับทั้ง `GET` สำหรับ Vercel Cron และ `POST` สำหรับ manual test

ต้องส่ง secret:

```http
Authorization: Bearer your-secret
```

หรือ:

```http
x-scheduler-secret: your-secret
```

---

## 8. ข้อจำกัดสำคัญของ Mock Production

ตอนนี้ระบบยังใช้ mock memory:

```txt
globalThis.nimbusDailyMockDb
```

บน local จะพอใช้งานทดสอบ flow ได้ แต่บน Vercel serverless:

- ข้อมูลอาจหายเมื่อ cold start
- Task ที่สร้างใหม่อาจไม่ persistent
- Task runs / notifications อาจ reset
- หลาย instance อาจมี memory ไม่ตรงกัน

ดังนั้นหลัง deploy แล้วใช้งาน production จริง ควรทำ Phase ถัดไป:

```txt
Phase 12: Database Integration ด้วย Supabase หรือ Firebase
```

---

## 9. Error ที่พบบ่อย

### Build error: Module not found

เช็กว่าไฟล์จากทุก phase ถูกวางครบ และ `tsconfig.json` มี alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Cron ไม่ทำงาน

เช็ก:

- มี `vercel.json` ที่ root project
- Deploy production แล้ว ไม่ใช่แค่ local
- Path `/api/scheduler/tick` ใช้งานได้
- `CRON_SECRET` หรือ `SCHEDULER_SECRET` ตั้งตรงกับที่ route ตรวจ

### OpenAI ไม่ทำงาน

เช็ก:

```env
ENABLE_OPENAI="true"
OPENAI_API_KEY="..."
OPENAI_MODEL="gpt-5.5"
```

ทดสอบ:

```bash
curl -X POST https://your-project.vercel.app/api/gpt/test
```

### Telegram ไม่ส่ง

เช็ก:

```env
ENABLE_TELEGRAM="true"
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
```

ทดสอบ:

```bash
curl -X POST https://your-project.vercel.app/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message":"NimbusDaily AI test"}'
```

---

## 10. สถานะหลังจบ Phase 11

ทำครบแล้ว:

```txt
Phase 1  Setup
Phase 2  Dashboard UI
Phase 3  Scheduled Tasks Page
Phase 4  Create Task Form
Phase 5  Task Results Page
Phase 6  Notifications Page
Phase 7  Mock API Routes
Phase 8  Run Now จำลอง
Phase 9  OpenAI API จริง
Phase 10 Telegram Bot จริง
Phase 11 Deploy Vercel
```

แนะนำต่อ:

```txt
Phase 12 Database Integration
Phase 13 Auth + User Workspace
Phase 14 Persistent Scheduler + Queue
```
