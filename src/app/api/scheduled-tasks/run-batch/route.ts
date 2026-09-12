import { fail, getRequestId, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultTaskSeeds, matchesDefaultTaskSeed, type BatchId, type TaskSeed } from "@/lib/default-scheduled-tasks";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { createScheduledTask, listScheduledTasks, updateScheduledTask } from "@/lib/repositories/scheduled-tasks.repository";
import { runTaskNow } from "@/services/task-runner.service";
import { sendTelegramMessage } from "@/services/telegram.service";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSeeds(batch: BatchId) {
  return getDefaultTaskSeeds(batch);
}

function isSent(status?: string | null) {
  return status === "sent" || Boolean(status?.startsWith("mock_sent"));
}

function toBatchId(value: unknown): BatchId {
  if (value === "two" || value === "three" || value === "four" || value === "all") return value;
  return "one";
}

function safeRedirectPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

async function parsePostBatchRequest(request: Request) {
  const url = new URL(request.url);
  const queryBatch = url.searchParams.get("batch");
  const queryRedirect = url.searchParams.get("redirect");
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({})) as { batch?: string; redirect?: string };
    return { batch: toBatchId(body.batch ?? queryBatch), redirectTo: safeRedirectPath(body.redirect ?? queryRedirect) };
  }

  const formData = await request.formData().catch(() => null);
  if (formData) return { batch: toBatchId(formData.get("batch") ?? queryBatch), redirectTo: safeRedirectPath(formData.get("redirect") ?? queryRedirect) };

  return { batch: toBatchId(queryBatch), redirectTo: safeRedirectPath(queryRedirect) };
}

function parseGetBatchRequest(request: Request) {
  const url = new URL(request.url);
  return { batch: toBatchId(url.searchParams.get("batch")), redirectTo: safeRedirectPath(url.searchParams.get("redirect")) };
}

async function ensureTask(userId: string, existingTasks: ScheduledTask[], seed: TaskSeed) {
  const existing = existingTasks.find((task) => matchesDefaultTaskSeed(task, seed));

  if (existing) {
    const patch: Partial<ScheduledTask> = {
      name: seed.name,
      type: seed.type,
      scheduleType: seed.scheduleType,
      cronExpression: seed.cronExpression,
      time: seed.time,
      dataSources: seed.dataSources,
      gptActions: seed.gptActions,
      outputChannels: ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
      minPriorityScore: seed.minPriorityScore,
      isActive: true,
      status: "Active",
    };
    const updated = await updateScheduledTask(existing.id, patch, userId);
    return updated ?? existing;
  }

  return createScheduledTask({
    userId,
    name: seed.name,
    type: seed.type,
    scheduleType: seed.scheduleType,
    cronExpression: seed.cronExpression,
    time: seed.time,
    timezone: "Asia/Bangkok",
    dataSources: seed.dataSources,
    gptActions: seed.gptActions,
    outputChannels: ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
    minPriorityScore: seed.minPriorityScore,
    isActive: true,
  });
}

async function runBatchForUser(userId: string, batch: BatchId) {
  const seeds = getSeeds(batch);
  const existingTasks = await listScheduledTasks({ userId });
  const results = [];
  let sentCount = 0;
  let failedCount = 0;
  let createdCount = 0;

  for (const seed of seeds) {
    try {
      const before = existingTasks.length;
      const task = await ensureTask(userId, existingTasks, seed);
      const existingIndex = existingTasks.findIndex((item) => item.id === task.id);
      if (existingIndex >= 0) existingTasks[existingIndex] = task;
      else existingTasks.push(task);
      if (existingTasks.length > before) createdCount += 1;

      const result = await runTaskNow(task.id, { userId, forceTelegram: true });
      const telegramStatus = result?.taskRun.telegramStatus ?? "not_run";
      const status = result?.taskRun.status ?? "not_found";
      if (isSent(telegramStatus)) sentCount += 1;
      if (!result || status === "failed" || telegramStatus.includes("failed")) failedCount += 1;
      results.push({ taskId: task.id, taskName: task.name, taskType: task.type, status, telegramStatus, priorityScore: result?.taskRun.priorityScore ?? null, runId: result?.taskRun.id ?? null });
    } catch (error) {
      failedCount += 1;
      results.push({ taskId: null, taskName: seed.name, taskType: seed.type, status: "failed", telegramStatus: "failed_batch_error", priorityScore: null, runId: null, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return { batch, summary: { requestedCount: seeds.length, sentCount, failedCount, createdCount }, results };
}

function buildPublicDemoTask(seed: TaskSeed): ScheduledTask {
  const now = new Date().toISOString();
  return {
    id: `public_${seed.key}`,
    userId: "public-demo",
    name: seed.name,
    type: seed.type,
    scheduleType: seed.scheduleType,
    cronExpression: seed.cronExpression,
    time: seed.time,
    timezone: "Asia/Bangkok",
    dataSources: seed.dataSources,
    gptActions: seed.gptActions,
    outputChannels: ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
    minPriorityScore: 0,
    status: "Active",
    isActive: true,
    lastRunAt: now,
    nextRunAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function buildPublicDemoRun(task: ScheduledTask, seed: TaskSeed): TaskRun {
  const now = new Date().toISOString();
  return {
    id: `public_run_${seed.key}_${Date.now()}`,
    taskId: task.id,
    status: "success",
    startedAt: now,
    finishedAt: now,
    rawInput: { source: "NimbusDaily public demo", topic: seed.label, dataSources: seed.dataSources },
    gptPrompt: `Send NimbusDaily public demo Telegram batch for ${seed.name}`,
    gptOutput: {
      title: seed.name,
      summary: `${seed.label} is ready from NimbusDaily. This public demo sends a compact Telegram status without requiring a sign-in session.`,
      priority_score: Math.max(seed.minPriorityScore, 70),
      recommended_action: "Open NimbusDaily dashboard to review details and run the full workflow.",
      caption: seed.name,
      image_prompt: null,
    },
    priorityScore: Math.max(seed.minPriorityScore, 70),
    telegramStatus: "pending",
    errorMessage: null,
    originalContent: undefined,
    translatedContent: undefined,
    language: "en",
    translatedAt: undefined,
    translation: undefined,
  };
}

async function runPublicDemoBatch(batch: BatchId) {
  const seeds = getSeeds(batch);
  const results = [];
  let sentCount = 0;
  let failedCount = 0;

  for (const seed of seeds) {
    try {
      const task = buildPublicDemoTask(seed);
      const run = buildPublicDemoRun(task, seed);
      const telegramResult = await sendTelegramMessage({ task, run });
      if (isSent(telegramResult.status)) sentCount += 1;
      if (telegramResult.status.includes("failed")) failedCount += 1;
      results.push({ taskId: task.id, taskName: task.name, taskType: task.type, status: "success", telegramStatus: telegramResult.status, priorityScore: run.priorityScore, runId: run.id });
    } catch (error) {
      failedCount += 1;
      results.push({ taskId: null, taskName: seed.name, taskType: seed.type, status: "failed", telegramStatus: "failed_public_demo_error", priorityScore: null, runId: null, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return { batch, summary: { requestedCount: seeds.length, sentCount, failedCount, createdCount: 0 }, results };
}

function redirectAfterRun(request: Request, redirectTo: string, result: Awaited<ReturnType<typeof runBatchForUser>>) {
  const url = new URL(redirectTo, request.url);
  url.searchParams.set("batch", result.batch);
  url.searchParams.set("sent", String(result.summary.sentCount));
  url.searchParams.set("total", String(result.summary.requestedCount));
  url.searchParams.set("failed", String(result.summary.failedCount));
  url.searchParams.set("created", String(result.summary.createdCount));
  url.searchParams.set("ts", String(Date.now()));
  return Response.redirect(url, 303);
}

async function handleBatchRequest(request: Request, batch: BatchId, redirectTo: string | null, requestId: string) {
  try {
    const ip = getClientIp(request);
    await assertRateLimit({ key: `run-batch:${ip}:${batch}`, limit: 4, windowMs: 60_000 });

    const user = await getCurrentUser();
    const result = user ? await runBatchForUser(user.id, batch) : await runPublicDemoBatch(batch);
    if (redirectTo) return redirectAfterRun(request, redirectTo, result);
    return ok(result, { requestId });
  } catch (error) {
    return fail(error, requestId);
  }
}

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const { batch, redirectTo } = parseGetBatchRequest(request);
  return handleBatchRequest(request, batch, redirectTo, requestId);
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const { batch, redirectTo } = await parsePostBatchRequest(request);
  return handleBatchRequest(request, batch, redirectTo, requestId);
}
