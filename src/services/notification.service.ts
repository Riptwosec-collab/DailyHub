import { createId } from "@/lib/mock-db";
import { createNotification } from "@/lib/repositories/notifications.repository";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";

export async function createNotificationFromTaskRun(task: ScheduledTask, run: TaskRun) {
  if (!task.outputChannels.includes("Save to Notifications")) return null;

  const notification: WebNotification = {
    id: createId("noti"),
    userId: task.userId,
    taskId: task.id,
    taskRunId: run.id,
    title: run.status === "success" ? `${task.name} พร้อมแล้ว` : `${task.name} มีปัญหา`,
    summary: run.gptOutput.summary,
    type: task.type,
    priorityScore: run.priorityScore,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  return await createNotification(notification);
}
