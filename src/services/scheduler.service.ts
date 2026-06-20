import { listDueScheduledTasks } from "@/lib/repositories/scheduled-tasks.repository";
import { runTaskNow } from "./task-runner.service";

export async function runSchedulerTick() {
  if (process.env.ENABLE_SCHEDULER === "false") {
    return {
      success: true,
      mode: "disabled",
      checkedAt: new Date().toISOString(),
      dueTasks: 0,
      results: [],
    };
  }

  const checkedAt = new Date().toISOString();
  const dueTasks = await listDueScheduledTasks(checkedAt);
  const results = [];

  for (const task of dueTasks) {
    const result = await runTaskNow(task.id, { schedulerMode: true });
    results.push({ taskId: task.id, taskName: task.name, status: result?.taskRun.status ?? "not_found", runId: result?.taskRun.id ?? null });
  }

  return {
    success: true,
    mode: process.env.USE_SUPABASE === "true" ? "supabase" : "mock",
    checkedAt,
    dueTasks: dueTasks.length,
    results,
  };
}
