# Phase 9: OpenAI API Integration

Phase 9 ต่อ OpenAI API จริงจากฝั่ง backend เท่านั้น โดยยังมี mock fallback สำหรับ dev/test

## Files

```txt
.env.example
src/services/openai.service.ts
src/services/task-runner.service.ts
src/app/api/gpt/test/route.ts
src/app/api/scheduled-tasks/[id]/run-now/route.ts
src/app/api/task-runs/[id]/regenerate/route.ts
```

## Env

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.5"
OPENAI_BASE_URL="https://api.openai.com/v1"
ENABLE_OPENAI="true"
OPENAI_FALLBACK_TO_MOCK="true"
```

## Test

```bash
curl -X POST http://localhost:3000/api/gpt/test
curl -X POST http://localhost:3000/api/scheduled-tasks/task_001/run-now
curl -X POST http://localhost:3000/api/task-runs/run_001/regenerate
```

## Behavior

- `ENABLE_OPENAI=false` => ใช้ mock GPT output
- `ENABLE_OPENAI=true` + `OPENAI_API_KEY` มีค่า => เรียก OpenAI Responses API
- `OPENAI_FALLBACK_TO_MOCK=true` => ถ้า API error จะใช้ mock output แทนและใส่หมายเหตุใน summary
- `OPENAI_FALLBACK_TO_MOCK=false` => ถ้า API error จะสร้าง failed task run พร้อม error_message
