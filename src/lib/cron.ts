import type { ScheduledTask } from "@/types/scheduled-task";

export function calculateNextRunAt(task: Pick<ScheduledTask, "scheduleType" | "time">) {
  const now = new Date();
  const next = new Date(now);

  if (task.scheduleType === "Hourly") {
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }

  if (task.scheduleType === "Weekly") {
    next.setDate(next.getDate() + 7);
    return applyTime(next, task.time).toISOString();
  }

  if (task.scheduleType === "Monthly") {
    next.setMonth(next.getMonth() + 1);
    return applyTime(next, task.time).toISOString();
  }

  if (task.scheduleType === "One Time") {
    next.setDate(next.getDate() + 1);
    return applyTime(next, task.time).toISOString();
  }

  if (task.scheduleType === "Custom Cron") {
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }

  next.setDate(next.getDate() + 1);
  return applyTime(next, task.time).toISOString();
}

function applyTime(date: Date, time?: string | null) {
  if (!time) return date;

  const [hours = "8", minutes = "0"] = time.split(":");
  date.setHours(Number(hours), Number(minutes), 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}
