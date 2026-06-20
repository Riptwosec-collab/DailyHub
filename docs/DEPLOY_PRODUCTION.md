# DailyHub AI Production Deploy

## GitHub

```bash
git init
git add .
git commit -m "DailyHub AI production MVP"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel

1. Import GitHub repo into Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Add environment variables from `.env.final.example`.
5. Deploy.

## Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel deploy --prod
```

## Test after deploy

```bash
curl https://your-app.vercel.app/api/health
curl -X POST https://your-app.vercel.app/api/gpt/test
curl -X POST https://your-app.vercel.app/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message":"DailyHub AI production test"}'
```

## Cron

`vercel.json` should contain `/api/scheduler/tick`. Secure manual calls with:

```bash
curl -X POST https://your-app.vercel.app/api/scheduler/tick \
  -H "Authorization: Bearer your-cron-secret"
```
