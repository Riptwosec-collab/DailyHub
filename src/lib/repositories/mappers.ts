import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { GptOutput, TaskRun } from "@/types/task-run";
import type { TranslatedResult } from "@/types/translation";

export type ScheduledTaskRow = {
  id: string;
  user_id: string;
  name: string;
  type: ScheduledTask["type"];
  schedule_type: ScheduledTask["scheduleType"];
  cron_expression: string | null;
  time: string | null;
  timezone: string;
  data_sources: string[];
  gpt_actions: string[];
  output_channels: string[];
  min_priority_score: number;
  status: ScheduledTask["status"];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskRunRow = {
  id: string;
  task_id: string;
  status: TaskRun["status"];
  started_at: string;
  finished_at: string | null;
  raw_input: Record<string, unknown>;
  gpt_prompt: string;
  gpt_output: GptOutput;
  priority_score: number;
  telegram_status: string;
  error_message: string | null;
};

export type WebNotificationRow = {
  id: string;
  user_id: string;
  task_id: string;
  task_run_id: string;
  title: string;
  summary: string;
  type: string;
  priority_score: number;
  is_read: boolean;
  created_at: string;
};

function getTranslationFromRawInput(rawInput: Record<string, unknown> | null | undefined): TranslatedResult | undefined {
  const translation = rawInput?.translation;
  if (!translation || typeof translation !== "object") return undefined;
  return translation as TranslatedResult;
}

export function mapTaskRow(row: ScheduledTaskRow): ScheduledTask {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    scheduleType: row.schedule_type,
    cronExpression: row.cron_expression,
    time: row.time,
    timezone: row.timezone,
    dataSources: row.data_sources ?? [],
    gptActions: row.gpt_actions ?? [],
    outputChannels: row.output_channels ?? [],
    minPriorityScore: row.min_priority_score,
    status: row.status,
    isActive: row.is_active,
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTaskToRow(task: Partial<ScheduledTask>) {
  return {
    ...(task.id !== undefined && { id: task.id }),
    ...(task.userId !== undefined && { user_id: task.userId }),
    ...(task.name !== undefined && { name: task.name }),
    ...(task.type !== undefined && { type: task.type }),
    ...(task.scheduleType !== undefined && { schedule_type: task.scheduleType }),
    ...(task.cronExpression !== undefined && { cron_expression: task.cronExpression }),
    ...(task.time !== undefined && { time: task.time }),
    ...(task.timezone !== undefined && { timezone: task.timezone }),
    ...(task.dataSources !== undefined && { data_sources: task.dataSources }),
    ...(task.gptActions !== undefined && { gpt_actions: task.gptActions }),
    ...(task.outputChannels !== undefined && { output_channels: task.outputChannels }),
    ...(task.minPriorityScore !== undefined && { min_priority_score: task.minPriorityScore }),
    ...(task.status !== undefined && { status: task.status }),
    ...(task.isActive !== undefined && { is_active: task.isActive }),
    ...(task.lastRunAt !== undefined && { last_run_at: task.lastRunAt }),
    ...(task.nextRunAt !== undefined && { next_run_at: task.nextRunAt }),
    ...(task.createdAt !== undefined && { created_at: task.createdAt }),
    ...(task.updatedAt !== undefined && { updated_at: task.updatedAt }),
  };
}

export function mapRunRow(row: TaskRunRow): TaskRun {
  const rawInput = row.raw_input ?? {};
  const translation = getTranslationFromRawInput(rawInput);

  return {
    id: row.id,
    taskId: row.task_id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    rawInput,
    gptPrompt: row.gpt_prompt,
    gptOutput: row.gpt_output,
    priorityScore: row.priority_score,
    telegramStatus: row.telegram_status,
    errorMessage: row.error_message,
    originalContent: translation?.originalContent,
    translatedContent: translation?.translatedSummary,
    language: translation?.originalLanguage,
    translatedAt: translation?.translatedAt,
    translation,
  };
}

export function mapRunToRow(run: Partial<TaskRun>) {
  return {
    ...(run.id !== undefined && { id: run.id }),
    ...(run.taskId !== undefined && { task_id: run.taskId }),
    ...(run.status !== undefined && { status: run.status }),
    ...(run.startedAt !== undefined && { started_at: run.startedAt }),
    ...(run.finishedAt !== undefined && { finished_at: run.finishedAt }),
    ...(run.rawInput !== undefined && { raw_input: run.rawInput }),
    ...(run.gptPrompt !== undefined && { gpt_prompt: run.gptPrompt }),
    ...(run.gptOutput !== undefined && { gpt_output: run.gptOutput }),
    ...(run.priorityScore !== undefined && { priority_score: run.priorityScore }),
    ...(run.telegramStatus !== undefined && { telegram_status: run.telegramStatus }),
    ...(run.errorMessage !== undefined && { error_message: run.errorMessage }),
  };
}

export function mapNotificationRow(row: WebNotificationRow): WebNotification {
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    taskRunId: row.task_run_id,
    title: row.title,
    summary: row.summary,
    type: row.type,
    priorityScore: row.priority_score,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export function mapNotificationToRow(notification: Partial<WebNotification>) {
  return {
    ...(notification.id !== undefined && { id: notification.id }),
    ...(notification.userId !== undefined && { user_id: notification.userId }),
    ...(notification.taskId !== undefined && { task_id: notification.taskId }),
    ...(notification.taskRunId !== undefined && { task_run_id: notification.taskRunId }),
    ...(notification.title !== undefined && { title: notification.title }),
    ...(notification.summary !== undefined && { summary: notification.summary }),
    ...(notification.type !== undefined && { type: notification.type }),
    ...(notification.priorityScore !== undefined && { priority_score: notification.priorityScore }),
    ...(notification.isRead !== undefined && { is_read: notification.isRead }),
    ...(notification.createdAt !== undefined && { created_at: notification.createdAt }),
  };
}
