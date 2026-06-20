# Phase 6: Notifications Page

เพิ่มหน้า `/notifications` สำหรับ DailyHub AI

## Features

- Notification cards
- Filter categories: Daily Brief, Email, Sale, Football, Long Read, Concert, Weekend, Custom
- Search notification / task / GPT output
- Read / Unread filter
- Important / Normal filter
- Priority score badge
- Open Result button
- Mock Mark Read / Mark Unread
- Mock Mark Important / Remove Important
- Mark All Read
- Responsive mobile
- Dark mode neon blue/purple glassmorphism

## Files

```txt
src/app/notifications/page.tsx
src/components/notifications/NotificationsView.tsx
src/components/notifications/NotificationCard.tsx
src/types/notification.ts
src/lib/mock-data.ts
```

## Run

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000/notifications
```
