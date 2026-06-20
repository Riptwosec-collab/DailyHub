import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";

export function getTelegramModeStatus() {
  const enabled = process.env.ENABLE_TELEGRAM === "true";
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const hasChatId = Boolean(process.env.TELEGRAM_CHAT_ID);
  return {
    mode: enabled && hasToken && hasChatId ? "real" : "mock",
    enabled,
    hasToken,
    hasChatId,
  };
}

export function buildTelegramMessage(task: ScheduledTask, run: TaskRun) {
  return `🤖 DailyHub AI Alert\n\nTask: ${task.name}\nType: ${task.type}\nPriority: ${run.priorityScore}/100\nStatus: ${run.status}\n\nSummary:\n${run.gptOutput.summary}\n\nRecommended Action:\n${run.gptOutput.recommended_action}`;
}

export async function sendTelegramMessage({ task, run }: { task: ScheduledTask; run: TaskRun }) {
  if (!task.outputChannels.includes("Send Telegram")) return { status: "not_enabled", message: "Task does not enable Telegram" };
  if (run.priorityScore < task.minPriorityScore) return { status: "skipped_priority", message: "Priority below threshold" };

  const enabled = process.env.ENABLE_TELEGRAM === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const fallback = process.env.TELEGRAM_FALLBACK_TO_MOCK !== "false";

  if (!enabled) return { status: "mock_sent", message: "Telegram disabled, mock sent" };
  if (!token || !chatId) return { status: fallback ? "mock_sent_missing_config" : "failed_missing_config", message: "Missing Telegram token or chat id" };

  try {
    const baseUrl = process.env.TELEGRAM_BASE_URL || "https://api.telegram.org";
    const response = await fetch(`${baseUrl}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: buildTelegramMessage(task, run) }),
    });

    if (!response.ok) throw new Error(`Telegram API failed: ${response.status}`);
    return { status: "sent", message: "Telegram message sent" };
  } catch (error) {
    if (fallback) return { status: "mock_sent_fallback", message: error instanceof Error ? error.message : "Telegram fallback" };
    return { status: "failed", message: error instanceof Error ? error.message : "Telegram failed" };
  }
}

export async function sendTelegramTestMessage(message = "DailyHub AI Telegram test") {
  const fakeTask = {
    id: "test",
    userId: "user_001",
    name: "Telegram Test",
    type: "Custom",
    scheduleType: "One Time",
    cronExpression: null,
    time: null,
    timezone: "Asia/Bangkok",
    dataSources: [],
    gptActions: [],
    outputChannels: ["Send Telegram"],
    minPriorityScore: 0,
    status: "Active",
    isActive: true,
    lastRunAt: null,
    nextRunAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ScheduledTask;

  const fakeRun = {
    id: "test_run",
    taskId: "test",
    status: "success",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    rawInput: {},
    gptPrompt: "",
    gptOutput: {
      title: "Telegram Test",
      summary: message,
      priority_score: 100,
      recommended_action: "No action needed",
      caption: null,
      image_prompt: null,
    },
    priorityScore: 100,
    telegramStatus: "pending",
    errorMessage: null,
  } as TaskRun;

  return await sendTelegramMessage({ task: fakeTask, run: fakeRun });
}
