# Phase 26: Final Safety Config

Phase 26 คือชุดตั้งค่าความปลอดภัยและความเสถียรก่อนต่อระบบจริง เช่น Supabase, OpenAI, Telegram และ external scheduler

## สิ่งที่เพิ่ม

- เพิ่ม `engines` ใน `package.json` เพื่อให้ Vercel ใช้ Node.js 20+
- เพิ่ม script `npm run check` สำหรับตรวจ TypeScript, ESLint และ Build ในคำสั่งเดียว
- เพิ่ม `.nvmrc` เพื่อให้เครื่อง dev ใช้ Node version ตรงกัน
- ปรับ `.gitignore` เพื่อกัน secret หลุดขึ้น GitHub

## คำสั่งที่ควรรันก่อน deploy ทุกครั้ง

```bash
npm run check
```

หรือแยกรัน:

```bash
npm run typecheck
npm run lint
npm run build
```

## ไฟล์ที่ห้าม commit ขึ้น GitHub

```txt
.env
.env.local
.env.*.local
.env.production
.env.development
.env.test
.vercel
node_modules
.next
```

## ไฟล์ env ที่อนุญาตให้ commit ได้

```txt
.env.example
.env.final.example
.env.phase18.example
```

ไฟล์เหล่านี้ต้องเป็นตัวอย่างเท่านั้น ห้ามมี secret จริง

## Vercel Environment Variables ที่ต้องตั้งใน Dashboard

```env
USE_SUPABASE=false
ALLOW_MOCK_USER=true
USE_MOCK_DATA=true

ENABLE_OPENAI=false
OPENAI_FALLBACK_TO_MOCK=true

ENABLE_TELEGRAM=false
TELEGRAM_FALLBACK_TO_MOCK=true

ENABLE_SCHEDULER=true
CRON_SECRET=change-this-cron-secret
SCHEDULER_SECRET=change-this-scheduler-secret
```

เมื่อพร้อมใช้ของจริง ค่อยเปลี่ยนเป็น:

```env
USE_SUPABASE=true
ALLOW_MOCK_USER=false
ENABLE_OPENAI=true
ENABLE_TELEGRAM=true
```

แล้วเพิ่ม secret จริงใน Vercel Dashboard เท่านั้น

## ลำดับถัดไปที่แนะนำ

1. เช็กว่า deploy ผ่านและทุกหน้าเปิดได้
2. ต่อ Supabase production
3. เปิด Auth จริง
4. เปิด OpenAI จริง
5. เปิด Telegram จริง
6. ใช้ external scheduler ถ้าต้องการรันถี่กว่า Vercel Hobby
