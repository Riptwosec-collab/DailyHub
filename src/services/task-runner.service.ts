import { calculateMockNextRun, createId } from "@/lib/mock-db";
import { getScheduledTaskById, updateScheduledTask } from "@/lib/repositories/scheduled-tasks.repository";
import { createTaskRun, getTaskRunById, updateTaskRun } from "@/lib/repositories/task-runs.repository";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { collectTaskDataSources } from "./data-source.service";
import { createNotificationFromTaskRun } from "./notification.service";
import { buildFailedGptOutput, buildGptPrompt, generateGptOutput, getErrorMessage } from "./openai.service";
import { sendTelegramMessage } from "./telegram.service";

export interface RunTaskNowResult {
  task: ScheduledTask;
  taskRun: TaskRun;
  notification: WebNotification | null;
}

export async function runTaskNow(taskId: string, options: { userId?: string; schedulerMode?: boolean } = {}): Promise<RunTaskNowResult | null> {
  const task = await getScheduledTaskById(taskId, options.schedulerMode ? undefined : options.userId);
  if (!task) return null;

  const startedAt = new Date().toISOString();
  await updateScheduledTask(task.id, { status: "Running", isActive: true, updatedAt: startedAt }, options.schedulerMode ? undefined : options.userId);

  const rawInput = await collectTaskDataSources(task);
  const gptPrompt = buildGptPrompt(task, rawInput);

  let gptOutput;
  let status: TaskRun["status"] = "success";
  let errorMessage: string | null = null;

  try {
    gptOutput = await generateGptOutput(task, rawInput);
  } catch (error) {
    status = "failed";
    errorMessage = getErrorMessage(error);
    gptOutput = buildFailedGptOutput(task, errorMessage);
  }

  const finishedAt = new Date().toISOString();
  const initialRun: TaskRun = {
    id: createId("run"),
    taskId: task.id,
    status,
    startedAt,
    finishedAt,
    rawInput,
    gptPrompt,
    gptOutput,
    priorityScore: gptOutput.priority_score,
    telegramStatus: status === "success" ? "pending" : "skipped_failed",
    errorMessage,
  };

  const telegramResult = status === "success" ? await sendTelegramMessage({ task, run: initialRun }) : { status: "skipped_failed" };

  const taskRun = await createTaskRun({ ...initialRun, telegramStatus: telegramResult.status });
  const notification = await createNotificationFromTaskRun(task, taskRun);

  const updatedTask = await updateScheduledTask(
    task.id,
    {
      status: status === "success" ? "Active" : "Failed",
      isActive: true,
      lastRunAt: finishedAt,
      nextRunAt: calculateMockNextRun(task.scheduleType),
      updatedAt: finishedAt,
    },
    options.schedulerMode ? undefined : options.userId,
  );

  return { task: updatedTask ?? task, taskRun, notification };
}

export async function regenerateTaskRun(runId: string, userId?: string) {
  const currentRun = await getTaskRunById(runId, userId);
  if (!currentRun) return null;

  const task = await getScheduledTaskById(currentRun.taskId, userId);
  if (!task) return null;

  const rawInput = await collectTaskDataSources(task);
  const gptPrompt = buildGptPrompt(task, rawInput);
  const now = new Date().toISOString();

  try {
    const gptOutput = await generateGptOutput(task, rawInput);
    return await updateTaskRun(runId, {
      status: "success",
      finishedAt: now,
      rawInput,
      gptPrompt,
      gptOutput,
      priorityScore: gptOutput.priority_score,
      telegramStatus: "regenerated",
      errorMessage: null,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const gptOutput = buildFailedGptOutput(task, errorMessage);
    return await updateTaskRun(runId, {
      status: "failed",
      finishedAt: now,
      rawInput,
      gptPrompt,
      gptOutput,
      priorityScore: 0,
      telegramStatus: "skipped_failed",
      errorMessage,
    });
  }
}
