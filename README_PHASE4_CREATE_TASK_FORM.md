# DailyHub AI - Phase 4: Create Task Form

Phase 4 เพิ่มหน้า `/scheduled-tasks/create` ให้เป็นฟอร์มสร้าง Scheduled Task แบบ mock UI พร้อม validation, payload preview และ mock save result

## สิ่งที่เพิ่ม

- Create Task Form
- Task Name
- Task Type
- Schedule Type
- One Time / Hourly / Daily / Weekly / Monthly / Custom Cron
- Time / Date / Timezone
- Data Sources multi-select
- GPT Actions multi-select
- Output Channels multi-select
- Min Priority Score slider
- Active / Paused toggle
- Cron preview
- Payload preview
- Mock save result
- Responsive mobile
- Dark neon blue/purple glassmorphism

## ไฟล์หลัก

```txt
src/app/scheduled-tasks/create/page.tsx
src/components/tasks/TaskForm.tsx
src/lib/validators.ts
```

## วิธีใช้งาน

Copy โฟลเดอร์ `src` ไปวางทับโปรเจกต์เดิม แล้วรัน:

```bash
npm install
npm run dev
```

เปิด:

```txt
http://localhost:3000/scheduled-tasks/create
```

## หมายเหตุ

Phase 4 ยังไม่บันทึกลง API จริง การกด Save Task จะ validate และสร้าง mock payload เท่านั้น

Phase ถัดไปคือ Phase 5: Task Results Page
