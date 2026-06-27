# NimbusDaily AI

NimbusDaily AI คือเว็บ Dashboard สำหรับสร้างและจัดการ **Scheduled Tasks** ภายในระบบ โดยให้ Backend Scheduler เป็นตัวรันงานตามเวลาที่ผู้ใช้ตั้งไว้ จากนั้นดึงข้อมูลจากแหล่งที่เลือก ส่งเข้า **OpenAI GPT API** เพื่อสรุป วิเคราะห์ ให้คะแนนความสำคัญ และสร้างคอนเทนต์ แล้วบันทึกผลลัพธ์กลับมาแสดงในหน้าเว็บ พร้อมส่งแจ้งเตือนผ่าน **Telegram Bot API** หากผู้ใช้เปิดใช้งาน

> สถานะโปรเจกต์: Mock-first MVP  
> โครงสร้างถูกออกแบบให้เริ่มด้วย Mock Data ได้ก่อน และพร้อมต่อ API จริง เช่น OpenAI, Telegram, Gmail, News API, Product Price API, Football API, Weather API และ Concert API ในภายหลัง

---

## Project Overview

Flow หลักของระบบ:

```txt
User สร้าง Scheduled Task ในเว็บ
        ↓
บันทึก Task ลง Database
        ↓
Backend Scheduler ตรวจทุก 1 นาที
        ↓
เจอ Task ที่ถึงเวลารัน
        ↓
Task Runner ดึงข้อมูลจาก Data Sources
        ↓
สร้าง GPT Prompt ตาม GPT Actions
        ↓
เรียก OpenAI GPT API
        ↓
บันทึกผลลัพธ์ลง task_runs
        ↓
สร้าง web_notifications
        ↓
ส่ง Telegram ถ้าเปิดใช้งาน
        ↓
คำนวณ next_run_at ใหม่
        ↓
แสดงผลใน Dashboard, Notifications, Task Results
```

---

## Core Features

### 1. Scheduled Tasks

หน้ารวม Task ทั้งหมดที่ผู้ใช้สร้างไว้

ฟีเจอร์หลัก:

- แสดงรายการ Scheduled Tasks ทั้งหมด
- แสดงสถานะ `Active`, `Paused`, `Failed`, `Running`
- แสดง `Last Run` และ `Next Run`
- ปุ่ม `Run Now`
- ปุ่ม `View Results`
- ปุ่ม `Edit`
- ปุ่ม `Pause`
- ปุ่ม `Delete`
- Filter ตามประเภท Task

ประเภท Task ที่รองรับ:

- Daily Brief
- Email Monitor
- Sale Monitor
- World Cup Recap
- Weekend Long Read
- Concert Alerts
- Weekend Ideas
- Custom

---

### 2. Create Scheduled Task

หน้าสร้าง Task ใหม่

ข้อมูลที่ผู้ใช้ตั้งค่าได้:

- Task Name
- Task Type
- Schedule Type
  - One Time
  - Hourly
  - Daily
  - Weekly
  - Monthly
  - Custom Cron
- Time
- Timezone
- Data Sources
  - News
  - Gmail
  - Product Prices
  - Football API
  - Weather API
  - Concert API
- GPT Actions
  - Summarize
  - Analyze Priority
  - Generate Caption
  - Generate Image Prompt
  - Recommend Action
- Output Channels
  - Save to Web Dashboard
  - Save to Notifications
  - Send Telegram
- Min Priority Score
- Save Task Button

---

### 3. Task Results

หน้าแสดงประวัติการรันของแต่ละ Task

ข้อมูลที่แสดง:

- Run status: `success`, `failed`, `running`
- Started At
- Finished At
- Raw Input
- GPT Prompt
- GPT Output
- Priority Score
- Telegram Status
- Error Log

Action buttons:

- Regenerate
- Copy
- Save as Content

---

### 4. Notifications

หน้ารวม Notification ที่สร้างจาก Scheduled Tasks

ฟีเจอร์หลัก:

- แสดง Notification Cards
- แยกหมวดตามประเภท:
  - Daily Brief
  - Email
  - Sale
  - Football
  - Long Read
  - Concert
  - Weekend
- สถานะ `Read` / `Unread`
- Badge `Important`
- Badge `Priority Score`
- ปุ่ม `Open Result`

---

### 5. Dashboard

หน้า Dashboard หลักของ NimbusDaily AI

สิ่งที่ต้องแสดงเพิ่ม:

- Scheduled Summary Cards
- จำนวน Task ที่ Active
- จำนวน Task ที่ Failed
- ผลลัพธ์ล่าสุดจาก GPT Scheduled Tasks
- Notifications ล่าสุด
- AI Command Box สำหรับสั่งงาน เช่น:

```txt
Run my Daily Brief now
Create a daily sale monitor at 9 AM
Show important email notifications
Generate weekend ideas for this Saturday
```

---

## Tech Stack

ค่าเริ่มต้นของโปรเจกต์นี้:

```txt
Frontend: Next.js, React, TypeScript, Tailwind CSS
Backend: Next.js API Routes / Node.js Services
Database: Supabase หรือ Firebase
AI: OpenAI GPT API
Notification: Telegram Bot API
Deploy: Vercel หรือ Node.js Server / Docker Worker
UI Style: Modern SaaS Dashboard, Dark Mode, Neon Blue + Purple, Glassmorphism
```

> หมายเหตุ: ถ้า deploy บน Vercel แบบ Serverless ล้วน การรัน Scheduler ทุก 1 นาทีแบบ long-running process อาจไม่เหมาะกับ production ควรใช้ Worker แยก, Docker, PM2, Cloud Run, Railway, Render, Supabase Edge Function Cron หรือ Vercel Cron เรียก endpoint `/api/scheduler/tick`

---

## Folder Structure

```txt
nimbusdaily-ai/
├─ README.md
├─ package.json
├─ .env.example
├─ next.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ dashboard/
│  │  │  └─ page.tsx
│  │  ├─ scheduled-tasks/
│  │  │  ├─ page.tsx
│  │  │  ├─ create/
│  │  │  │  └─ page.tsx
│  │  │  └─ [id]/
│  │  │     └─ page.tsx
│  │  ├─ task-results/
│  │  │  ├─ page.tsx
│  │  │  └─ [id]/
│  │  │     └─ page.tsx
│  │  ├─ notifications/
│  │  │  └─ page.tsx
│  │  └─ api/
│  │     ├─ scheduled-tasks/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     ├─ route.ts
│  │     │     └─ run-now/
│  │     │        └─ route.ts
│  │     ├─ task-runs/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     ├─ route.ts
│  │     │     └─ regenerate/
│  │     │        └─ route.ts
│  │     ├─ notifications/
│  │     │  ├─ route.ts
│  │     │  └─ [id]/
│  │     │     └─ read/
│  │     │        └─ route.ts
│  │     ├─ telegram/
│  │     │  └─ test/
│  │     │     └─ route.ts
│  │     ├─ gpt/
│  │     │  └─ test/
│  │     │     └─ route.ts
│  │     └─ scheduler/
│  │        └─ tick/
│  │           └─ route.ts
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ Topbar.tsx
│  │  │  └─ MobileNav.tsx
│  │  ├─ tasks/
│  │  │  ├─ TaskCard.tsx
│  │  │  ├─ TaskTable.tsx
│  │  │  ├─ TaskForm.tsx
│  │  │  ├─ TaskStatusBadge.tsx
│  │  │  └─ PriorityScoreBadge.tsx
│  │  ├─ results/
│  │  │  ├─ TaskRunTimeline.tsx
│  │  │  ├─ GptOutputCard.tsx
│  │  │  └─ ErrorLogCard.tsx
│  │  ├─ notifications/
│  │  │  └─ NotificationCard.tsx
│  │  ├─ dashboard/
│  │  │  ├─ ScheduledSummary.tsx
│  │  │  ├─ LatestGptResults.tsx
│  │  │  └─ AiCommandBox.tsx
│  │  └─ ui/
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ Input.tsx
│  │     ├─ Select.tsx
│  │     ├─ Badge.tsx
│  │     ├─ EmptyState.tsx
│  │     ├─ LoadingState.tsx
│  │     └─ ErrorState.tsx
│  ├─ services/
│  │  ├─ scheduler.service.ts
│  │  ├─ task-runner.service.ts
│  │  ├─ openai.service.ts
│  │  ├─ telegram.service.ts
│  │  ├─ notification.service.ts
│  │  ├─ daily-brief.service.ts
│  │  ├─ email-monitor.service.ts
│  │  ├─ sale-monitor.service.ts
│  │  ├─ football.service.ts
│  │  └─ weekend-ideas.service.ts
│  ├─ lib/
│  │  ├─ db.ts
│  │  ├─ env.ts
│  │  ├─ cron.ts
│  │  ├─ mock-data.ts
│  │  ├─ validators.ts
│  │  └─ utils.ts
│  ├─ types/
│  │  ├─ scheduled-task.ts
│  │  ├─ task-run.ts
│  │  └─ notification.ts
│  └─ styles/
│     └─ globals.css
```

---

## Backend Services

### `scheduler.service.ts`

หน้าที่:

- ตรวจ Task ที่ถึงเวลารัน
- Query `scheduled_tasks` ที่ `is_active=true`
- เช็ก `next_run_at <= now`
- ส่ง Task ไปให้ `task-runner.service.ts`
- คำนวณ `next_run_at` รอบถัดไป

---

### `task-runner.service.ts`

หน้าที่:

- รับ Task จาก Scheduler หรือ Run Now
- ดึงข้อมูลจาก Data Sources
- สร้าง GPT Prompt
- เรียก `openai.service.ts`
- บันทึก `task_runs`
- สร้าง `web_notifications`
- ส่ง Telegram ถ้าเปิด Output Channel
- จัดการ error และ status

---

### `openai.service.ts`

หน้าที่:

- เรียก OpenAI GPT API จากฝั่ง backend เท่านั้น
- สร้าง prompt ตาม GPT Actions
- Parse response ให้เป็นโครงสร้าง เช่น summary, priority_score, recommended_action, content

ตัวอย่าง Output ที่ต้องการจาก GPT:

```json
{
  "title": "Daily Brief Summary",
  "summary": "สรุปข่าวสำคัญประจำวันที่เกี่ยวข้องกับหัวข้อที่เลือก",
  "priority_score": 82,
  "recommended_action": "ควรอ่านรายละเอียดเพิ่มเติมและบันทึกไว้ใน Dashboard",
  "caption": "สรุปสั้น อ่านง่าย พร้อมใช้โพสต์",
  "image_prompt": "Vertical 9:16 modern dashboard content image prompt"
}
```

---

### `telegram.service.ts`

หน้าที่:

- ส่งข้อความแจ้งเตือนไป Telegram
- ใช้ Telegram Bot Token จาก `.env`
- ส่งเฉพาะ Task ที่เปิด `Send Telegram`
- ส่งเฉพาะผลลัพธ์ที่ `priority_score >= min_priority_score`

---

### `notification.service.ts`

หน้าที่:

- สร้าง Notification Cards จากผล Task Run
- บันทึกลง `web_notifications`
- แยกหมวดตาม Task Type
- จัดการ Read / Unread

---

## Database Schema

### `scheduled_tasks`

```sql
create table scheduled_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text not null,
  schedule_type text not null,
  cron_expression text,
  time text,
  timezone text default 'Asia/Bangkok',
  data_sources jsonb default '[]'::jsonb,
  gpt_actions jsonb default '[]'::jsonb,
  output_channels jsonb default '[]'::jsonb,
  min_priority_score int default 0,
  is_active boolean default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

ตัวอย่างข้อมูล:

```json
{
  "id": "task_001",
  "user_id": "user_001",
  "name": "Morning Daily Brief",
  "type": "Daily Brief",
  "schedule_type": "Daily",
  "cron_expression": "0 8 * * *",
  "time": "08:00",
  "timezone": "Asia/Bangkok",
  "data_sources": ["News", "Weather API"],
  "gpt_actions": ["Summarize", "Analyze Priority", "Recommend Action"],
  "output_channels": ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
  "min_priority_score": 70,
  "is_active": true,
  "last_run_at": "2026-06-20T01:00:00.000Z",
  "next_run_at": "2026-06-21T01:00:00.000Z"
}
```

---

### `task_runs`

```sql
create table task_runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references scheduled_tasks(id) on delete cascade,
  status text not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  raw_input jsonb,
  gpt_prompt text,
  gpt_output jsonb,
  priority_score int default 0,
  telegram_status text,
  error_message text
);
```

ตัวอย่างข้อมูล:

```json
{
  "id": "run_001",
  "task_id": "task_001",
  "status": "success",
  "started_at": "2026-06-20T01:00:00.000Z",
  "finished_at": "2026-06-20T01:00:12.000Z",
  "raw_input": {
    "news": ["AI market update", "Weather update"]
  },
  "gpt_prompt": "Summarize and prioritize today's updates...",
  "gpt_output": {
    "title": "Morning Daily Brief",
    "summary": "วันนี้มีข่าว AI และสภาพอากาศที่ควรรู้...",
    "recommended_action": "อ่านข่าว AI เพิ่มเติม"
  },
  "priority_score": 82,
  "telegram_status": "sent",
  "error_message": null
}
```

---

### `web_notifications`

```sql
create table web_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid references scheduled_tasks(id) on delete cascade,
  task_run_id uuid references task_runs(id) on delete cascade,
  title text not null,
  summary text,
  type text not null,
  priority_score int default 0,
  is_read boolean default false,
  created_at timestamptz default now()
);
```

ตัวอย่างข้อมูล:

```json
{
  "id": "noti_001",
  "user_id": "user_001",
  "task_id": "task_001",
  "task_run_id": "run_001",
  "title": "Morning Daily Brief พร้อมแล้ว",
  "summary": "GPT สรุปข่าวสำคัญและคำแนะนำประจำวันเรียบร้อยแล้ว",
  "type": "Daily Brief",
  "priority_score": 82,
  "is_read": false,
  "created_at": "2026-06-20T01:00:13.000Z"
}
```

---

## API Routes

### Scheduled Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scheduled-tasks` | ดึงรายการ Scheduled Tasks ทั้งหมด |
| POST | `/api/scheduled-tasks` | สร้าง Scheduled Task ใหม่ |
| GET | `/api/scheduled-tasks/:id` | ดึงรายละเอียด Task ตาม ID |
| PATCH | `/api/scheduled-tasks/:id` | แก้ไข Task |
| DELETE | `/api/scheduled-tasks/:id` | ลบ Task |
| POST | `/api/scheduled-tasks/:id/run-now` | จำลองหรือสั่งรัน Task ทันที |

---

### Task Runs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/task-runs` | ดึงประวัติการรัน Task ทั้งหมด |
| GET | `/api/task-runs/:id` | ดึงรายละเอียดผลการรัน |
| POST | `/api/task-runs/:id/regenerate` | สร้าง GPT Output ใหม่จาก raw input เดิม |

---

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | ดึง Notifications ทั้งหมด |
| PATCH | `/api/notifications/:id/read` | เปลี่ยนสถานะ Notification เป็น Read |

---

### Integrations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/telegram/test` | ทดสอบส่ง Telegram |
| POST | `/api/gpt/test` | ทดสอบเรียก GPT API |
| POST | `/api/scheduler/tick` | Endpoint สำหรับให้ Scheduler หรือ Cron เรียกเช็ก Task ที่ถึงเวลา |

---

## Request / Response Examples

### Create Scheduled Task

```http
POST /api/scheduled-tasks
Content-Type: application/json
```

```json
{
  "name": "Morning AI Brief",
  "type": "Daily Brief",
  "schedule_type": "Daily",
  "time": "08:00",
  "timezone": "Asia/Bangkok",
  "data_sources": ["News", "Weather API"],
  "gpt_actions": ["Summarize", "Analyze Priority", "Recommend Action"],
  "output_channels": ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
  "min_priority_score": 70
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "task_001",
    "name": "Morning AI Brief",
    "status": "Active",
    "next_run_at": "2026-06-21T01:00:00.000Z"
  }
}
```

---

### Run Now

```http
POST /api/scheduled-tasks/task_001/run-now
```

Response:

```json
{
  "success": true,
  "data": {
    "task_run_id": "run_001",
    "status": "success",
    "priority_score": 82,
    "telegram_status": "sent"
  }
}
```

---

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "OPENAI_REQUEST_FAILED",
    "message": "Failed to generate GPT output. Please try again."
  }
}
```

---

## Scheduler Flow

Scheduler จะทำงานทุก 1 นาที หรือถูกเรียกผ่าน `/api/scheduler/tick`

ขั้นตอน:

1. Query `scheduled_tasks`
2. เลือก Task ที่ `is_active=true`
3. เลือก Task ที่ `next_run_at <= now`
4. เปลี่ยนสถานะเป็น `Running`
5. ส่ง Task ให้ `task-runner.service.ts`
6. ดึงข้อมูลจาก `data_sources`
7. สร้าง GPT Prompt จาก `gpt_actions`
8. เรียก OpenAI GPT API
9. บันทึกผลลง `task_runs`
10. สร้าง `web_notifications`
11. ถ้าเปิด Telegram และ `priority_score >= min_priority_score` ให้ส่ง Telegram
12. อัปเดต `last_run_at`
13. คำนวณ `next_run_at`
14. เปลี่ยนสถานะ Task กลับเป็น `Active` หรือ `Failed`

---

## GPT Prompt Strategy

ระบบควรสร้าง Prompt แบบ dynamic จาก Task Type, Data Sources และ GPT Actions

ตัวอย่าง Prompt:

```txt
You are NimbusDaily AI.
Task Type: Daily Brief
Data Sources: News, Weather API
Actions: Summarize, Analyze Priority, Recommend Action

Please analyze the raw input and return JSON only.

Required JSON format:
{
  "title": string,
  "summary": string,
  "priority_score": number,
  "recommended_action": string,
  "caption": string | null,
  "image_prompt": string | null
}

Raw Input:
{{raw_input}}
```

ข้อกำหนดของ GPT Output:

- ต้องคืนค่าเป็น JSON ที่ parse ได้
- `priority_score` ต้องอยู่ระหว่าง 0-100
- ถ้าข้อมูลไม่พอ ให้ใส่ข้อความอธิบาย ไม่ควรเดาข้อมูลเกินจริง
- ถ้า Task เป็น Content Creation ให้สร้าง Caption และ Image Prompt เพิ่ม

---

## Telegram Notification Format

ตัวอย่างข้อความที่ส่งไป Telegram:

```txt
🤖 NimbusDaily AI Alert

Task: Morning AI Brief
Type: Daily Brief
Priority: 82/100

Summary:
วันนี้มีข่าว AI สำคัญและสภาพอากาศที่ควรระวัง...

Recommended Action:
อ่านข่าว AI เพิ่มเติมและบันทึกไว้ใน Dashboard
```

Telegram จะถูกส่งเมื่อ:

```txt
output_channels includes "Send Telegram"
AND priority_score >= min_priority_score
AND TELEGRAM_BOT_TOKEN exists
AND TELEGRAM_CHAT_ID exists
```

---

## Environment Variables

สร้างไฟล์ `.env.local` จาก `.env.example`

```env
# App
NEXT_PUBLIC_APP_NAME="NimbusDaily AI"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_TIMEZONE="Asia/Bangkok"

# Database
DATABASE_URL=""

# Supabase optional
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# OpenAI - backend only, never expose to frontend
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"

# Telegram - backend only
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# Feature flags
USE_MOCK_DATA="true"
ENABLE_SCHEDULER="true"
ENABLE_TELEGRAM="false"
ENABLE_OPENAI="false"

# Scheduler security
SCHEDULER_SECRET="change-this-secret"
```

Security rules:

- ห้ามใช้ `NEXT_PUBLIC_` กับ API Key ที่เป็น secret
- ห้ามเก็บ OpenAI API Key ใน frontend
- ห้ามเก็บ Telegram Bot Token ใน frontend
- Production ควรเก็บ secret ใน Environment Variables ของ Hosting Provider
- ถ้าให้ผู้ใช้แต่ละคนใส่ Telegram Token เอง ควรเก็บแบบ encrypted storage ฝั่ง backend

---

## Mock Data Mode

ช่วงแรกให้ใช้ Mock Data ก่อนเพื่อพัฒนา UI และ Flow ให้ครบ

เมื่อ `USE_MOCK_DATA=true`:

- Scheduled Tasks ใช้ mock array หรือ mock database
- Run Now จะจำลองการรัน Task
- GPT Output จะถูกสร้างเป็น mock response
- Telegram Status จะจำลองเป็น `mock_sent`
- Notifications จะถูกสร้างจาก Task Runs จำลอง

เมื่อพร้อมเชื่อมจริง:

```env
USE_MOCK_DATA="false"
ENABLE_OPENAI="true"
ENABLE_TELEGRAM="true"
```

---

## UI Design Guidelines

Style หลัก:

```txt
Modern SaaS Dashboard
Dark Mode
Neon Blue + Purple
Glassmorphism
Responsive Desktop/Mobile
Card-based Layout
Sidebar Navigation
Search Bar
Filter
Tags
Status Badge
Priority Score Badge
Timeline ของ Task Runs
```

หน้าจอควรมี state ต่อไปนี้เสมอ:

- Loading State
- Empty State
- Error State
- Success State
- Disabled State ระหว่างกำลัง Run Task

ตัวอย่าง Status Badge:

```txt
Active  = Neon Green
Paused  = Gray
Running = Blue / Purple
Failed  = Red
Success = Green
Unread  = Blue Dot
Important = Purple / Red Badge
```

---

## Installation

```bash
npm install
```

สร้างไฟล์ env:

```bash
cp .env.example .env.local
```

รันโปรเจกต์:

```bash
npm run dev
```

เปิดเว็บ:

```txt
http://localhost:3000
```

---

## Development Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## Testing Checklist

### 1. Dashboard

เปิดหน้า:

```txt
/dashboard
```

ควรเห็น:

- Scheduled Summary Cards
- Active Tasks
- Latest GPT Results
- Latest Notifications
- AI Command Box

---

### 2. Scheduled Tasks

เปิดหน้า:

```txt
/scheduled-tasks
```

ควรเห็น:

- รายการ Tasks
- Status Badge
- Last Run
- Next Run
- ปุ่ม Run Now, View Results, Edit, Pause, Delete
- Filter ตาม Task Type

---

### 3. Create Scheduled Task

เปิดหน้า:

```txt
/scheduled-tasks/create
```

ทดสอบ:

1. กรอกชื่อ Task
2. เลือก Task Type เป็น `Daily Brief`
3. เลือก Schedule Type เป็น `Daily`
4. ตั้งเวลา `08:00`
5. เลือก Data Sources เป็น `News`
6. เลือก GPT Actions เป็น `Summarize` และ `Analyze Priority`
7. เลือก Output Channels เป็น `Save to Web Dashboard` และ `Save to Notifications`
8. กด Save Task

ผลลัพธ์ที่ควรเห็น:

- Task ถูกสร้างสำเร็จ
- Redirect กลับไปหน้า Scheduled Tasks
- Task ใหม่แสดงในรายการ
- มี Next Run ถูกคำนวณ

---

### 4. Run Now

ที่หน้า:

```txt
/scheduled-tasks
```

ทดสอบ:

1. กดปุ่ม `Run Now`
2. ระบบควรเปลี่ยนสถานะเป็น `Running`
3. สร้าง `task_runs` ใหม่
4. สร้าง Notification ใหม่
5. แสดงผลลัพธ์ล่าสุดใน Dashboard

ผลลัพธ์ที่ควรเห็น:

```txt
Task Run created successfully
GPT Output generated
Notification created
Telegram status = mock_sent หรือ sent
```

---

### 5. Task Results

เปิดหน้า:

```txt
/task-results
```

ควรเห็น:

- ประวัติการรันทั้งหมด
- Status success / failed / running
- Raw Input
- GPT Prompt
- GPT Output
- Priority Score
- Telegram Status
- Error Log

---

### 6. Notifications

เปิดหน้า:

```txt
/notifications
```

ควรเห็น:

- Notification Cards
- หมวด Daily Brief, Email, Sale, Football, Long Read, Concert, Weekend
- Read / Unread State
- Priority Score Badge
- ปุ่ม Open Result

---

## Production Notes

### Scheduler บน Production

ถ้าใช้ Next.js บน Vercel แบบ Serverless:

- ไม่ควรใช้ `setInterval` เป็น Scheduler หลักใน production
- ควรใช้ `/api/scheduler/tick` แล้วให้ Cron ภายนอกเรียก
- ตัวเลือกที่แนะนำ:
  - Vercel Cron Jobs
  - Supabase Scheduled Edge Functions
  - Railway Cron
  - Render Cron
  - GitHub Actions Cron
  - Docker Worker + node-cron
  - PM2 process บน VPS

ตัวอย่าง flow production:

```txt
Cron Provider → POST /api/scheduler/tick → scheduler.service.ts → task-runner.service.ts
```

ควรป้องกัน endpoint ด้วย `SCHEDULER_SECRET`

```http
POST /api/scheduler/tick
Authorization: Bearer your-scheduler-secret
```

---

## Security Notes

สิ่งที่ห้ามทำ:

- ห้าม hardcode `OPENAI_API_KEY`
- ห้าม hardcode `TELEGRAM_BOT_TOKEN`
- ห้ามส่ง secret ไป frontend
- ห้ามใช้ `NEXT_PUBLIC_` กับ token ลับ
- ห้าม log raw secret ลง console

สิ่งที่ควรทำ:

- ใช้ `.env.local` ในเครื่อง
- ใช้ Environment Variables บน production
- validate request body ทุก API
- จำกัดสิทธิ์ตาม `user_id`
- ใช้ Rate Limit กับ Run Now
- เก็บ Error Log แบบไม่เปิดเผย secret
- ถ้าเก็บ token ของผู้ใช้ ให้ encrypt ก่อนบันทึกลง Database

---

## Future Improvements

ฟีเจอร์ที่สามารถต่อยอดได้:

- User Authentication
- Team Workspace
- Telegram per user
- Email OAuth ผ่าน Gmail API
- Webhook Trigger
- AI Prompt Template Builder
- Task Run Timeline แบบละเอียด
- Retry Policy เมื่อ Task Failed
- Queue System เช่น BullMQ หรือ Upstash QStash
- Vector Memory สำหรับ Long Read
- Content Calendar
- Export Task Results เป็น Markdown / PDF
- Multi-language Output
- AI Image Generation Queue
- Admin Monitoring Dashboard

---

## Summary

NimbusDaily AI คือระบบ Dashboard ที่ช่วยให้ผู้ใช้สร้าง Scheduled Tasks ได้จากหน้าเว็บ แล้วให้ Backend เป็นตัวรันงานตามเวลา ดึงข้อมูล ส่งให้ GPT วิเคราะห์ สรุป ให้คะแนน สร้างคอนเทนต์ บันทึกผลกลับมาแสดงในเว็บ และส่ง Telegram Notification ได้

เป้าหมายของ MVP:

```txt
สร้าง Task ได้
รัน Task แบบ Mock ได้
สร้าง Task Result ได้
สร้าง Notification ได้
แสดงผลใน Dashboard ได้
พร้อมเชื่อม OpenAI API และ Telegram API จริงภายหลัง
```
