# NimbusDaily AI - Phase 10: Telegram Bot Integration

Phase 10 เพิ่ม Telegram Bot API ของจริงเข้า backend โดยยังมี mock fallback เพื่อให้ dev flow ไม่พัง

## สิ่งที่เพิ่ม

- `telegram.service.ts` เรียก Telegram Bot API จริง
- `POST /api/telegram/test` สำหรับทดสอบส่งข้อความ
- `task-runner.service.ts` ส่ง Telegram จริงหลัง Run Now สำเร็จ
- `.env.example` เพิ่ม Telegram config

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
TELEGRAM_BASE_URL="https://api.telegram.org"
ENABLE_TELEGRAM="false"
TELEGRAM_FALLBACK_TO_MOCK="true"
```

เปิดใช้งานจริง:

```env
ENABLE_TELEGRAM="true"
TELEGRAM_BOT_TOKEN="ใส่ token จาก BotFather"
TELEGRAM_CHAT_ID="ใส่ chat id ของคุณ"
TELEGRAM_FALLBACK_TO_MOCK="true"
```

## Flow

```txt
Run Now
→ task-runner.service.ts
→ generate GPT output
→ create Task Run
→ ถ้า task.outputChannels มี Send Telegram
→ ถ้า priorityScore >= minPriorityScore
→ sendTelegramMessage()
→ Telegram Bot API /sendMessage
→ บันทึก telegramStatus ใน task_runs
```

## วิธีทดสอบ Telegram

```bash
curl -X POST http://localhost:3000/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message":"NimbusDaily AI Telegram test"}'
```

## วิธีทดสอบผ่าน Run Now

เลือก task ที่ `outputChannels` มี `Send Telegram` และ priority ถึง `minPriorityScore`:

```bash
curl -X POST http://localhost:3000/api/scheduled-tasks/task_001/run-now
```

จากนั้นตรวจ task run:

```bash
curl http://localhost:3000/api/task-runs
```

ค่า `telegramStatus` ที่อาจเจอ:

```txt
sent
mock_sent
mock_sent_missing_config
mock_sent_fallback
not_enabled
skipped_priority
skipped_failed
failed
failed_missing_config
```

## Security Notes

- ห้ามใช้ `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`
- ห้ามส่ง bot token ไป frontend
- ห้าม commit `.env.local`
- Telegram token ต้องอยู่ backend environment เท่านั้น
- ใน production ควรใช้ environment variables ของ Vercel หรือ hosting provider

## หมายเหตุ

ตอนนี้ Database ยังเป็น mock memory ผ่าน `globalThis.nimbusDailyMockDb`

Phase ถัดไปคือ Phase 11: Deploy Vercel
