import { listDueScheduledTasks, listScheduledTasks, updateScheduledTask } from "@/lib/repositories/scheduled-tasks.repository";
import { runTaskNow } from "./task-runner.service";

export type SchedulerTickOptions = {
  /**
   * When true, run every task immediately instead of only tasks whose
   * nextRunAt is due. This is useful for manual GitHub Actions testing.
   */
  force?: boolean;
};

function withTelegramChannel(outputChannels: string[]) {
  return outputChannels.includes("Send Telegram") ? outputChannels : [...outputChannels, "Send Telegram"];
}

export async function runSchedulerTick(options: SchedulerTickOptions = {}) {
  if (process.env.ENABLE_SCHEDULER === "false") {
    return {
      success: true,
      mode: "disabled",
      checkedAt: new Date().toISOString(),
      force: Boolean(options.force),
      dueTasks: 0,
      results: [],
    };
  }

  const checkedAt = new Date().toISOString();
  const dueTasks = options.force ? await listScheduledTasks() : await listDueScheduledTasks(checkedAt);
  const results = [];

  for (const task of dueTasks) {
    const taskForRun = options.force
      ? await updateScheduledTask(task.id, {
          outputChannels: withTelegramChannel(task.outputChannels),
          minPriorityScore: process.env.TELEGRAM_IGNORE_PRIORITY === "true" ? 0 : task.minPriorityScore,
        })
      : task;

    const result = await runTaskNow((taskForRun ?? task).id, { schedulerMode: true });
    results.push({
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      status: result?.taskRun.status ?? "not_found",
      runId: result?.taskRun.id ?? null,
      telegramStatus: result?.taskRun.telegramStatus ?? null,
      priorityScore: result?.taskRun.priorityScore ?? null,
      minPriorityScore: (taskForRun ?? task).minPriorityScore,
      outputChannels: (taskForRun ?? task).outputChannels,
      language: result?.taskRun.language ?? null,
      translatedAt: result?.taskRun.translatedAt ?? null,
    });
  }

  return {
    success: true,
    mode: process.env.USE_SUPABASE === "true" ? "supabase" : "mock",
    checkedAt,
    force: Boolean(options.force),
    dueTasks: dueTasks.length,
    results,
  };
}
