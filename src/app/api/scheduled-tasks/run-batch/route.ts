import { fail, getRequestId, ok } from "@/lib/api/response";
import { requireCurrentUser } from "@/lib/auth";
import { createScheduledTask, listScheduledTasks } from "@/lib/repositories/scheduled-tasks.repository";
import { runTaskNow } from "@/services/task-runner.service";
import type { ScheduledTask } from "@/types/scheduled-task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BatchId = "one" | "two" | "all";

type TaskSeed = {
  key: string;
  label: string;
  name: string;
  type: ScheduledTask["type"];
  scheduleType: ScheduledTask["scheduleType"];
  cronExpression: string;
  time: string | null;
  dataSources: string[];
  gptActions: string[];
  minPriorityScore: number;
};

const DEFAULT_TASKS: TaskSeed[] = [
  {
    key: "daily-brief",
    label: "Morning Daily Brief",
    name: "Morning Daily Brief",
    type: "Daily Brief",
    scheduleType: "Daily",
    cronExpression: "0 8 * * *",
    time: "08:00",
    dataSources: ["News", "Weather API"],
    gptActions: ["Summarize", "Analyze Priority", "Recommend Action"],
    minPriorityScore: 70,
  },
  {
    key: "global-product-radar",
    label: "สินค้าใหม่/น่าสนใจทั่วโลก",
    name: "สินค้าใหม่/น่าสนใจทั่วโลก",
    type: "Sale Monitor",
    scheduleType: "Hourly",
    cronExpression: "0 * * * *",
    time: null,
    dataSources: ["Global Product Radar"],
    gptActions: ["Analyze Priority", "Generate Caption", "Recommend Action"],
    minPriorityScore: 70,
  },
  {
    key: "weekend-ideas",
    label: "Weekend Ideas Generator",
    name: "Weekend Ideas Generator",
    type: "Weekend Ideas",
    scheduleType: "Weekly",
    cronExpression: "0 9 * * 6",
    time: "09:00",
    dataSources: ["Weather API", "News", "Weekend Ideas"],
    gptActions: ["Summarize", "Recommend Action", "Generate Image Prompt"],
    minPriorityScore: 60,
  },
  {
    key: "email-monitor",
    label: "Important Email Monitor",
    name: "Important Email Monitor",
    type: "Email Monitor",
    scheduleType: "Hourly",
    cronExpression: "*/30 * * * *",
    time: null,
    dataSources: ["Gmail"],
    gptActions: ["Summarize", "Analyze Priority", "Recommend Action"],
    minPriorityScore: 80,
  },
  {
    key: "concert-alerts",
    label: "Concert Alerts Near Me",
    name: "Concert Alerts Near Me",
    type: "Concert Alerts",
    scheduleType: "Daily",
    cronExpression: "0 20 * * *",
    time: "20:00",
    dataSources: ["Concert API"],
    gptActions: ["Summarize", "Analyze Priority", "Recommend Action"],
    minPriorityScore: 75,
  },
  {
    key: "football-recap",
    label: "Football Recap Nightly",
    name: "Football Recap Nightly",
    type: "World Cup Recap",
    scheduleType: "Daily",
    cronExpression: "0 23 * * *",
    time: "23:00",
    dataSources: ["Football API"],
    gptActions: ["Summarize", "Generate Caption", "Recommend Action"],
    minPriorityScore: 65,
  },
  {
    key: "weekend-long-read",
    label: "Weekend Long Read Picker",
    name: "Weekend Long Read Picker",
    type: "Weekend Long Read",
    scheduleType: "Weekly",
    cronExpression: "0 10 * * 6",
    time: "10:00",
    dataSources: ["News", "Weekend Long Read"],
    gptActions: ["Summarize", "Analyze Priority", "Recommend Action"],
    minPriorityScore: 55,
  },
];

const BATCH_ONE_KEYS = ["daily-brief", "global-product-radar", "weekend-ideas", "email-monitor"];
const BATCH_TWO_KEYS = ["concert-alerts", "football-recap", "weekend-long-read"];

function getKeys(batch: BatchId) {
  if (batch === "one") return BATCH_ONE_KEYS;
  if (batch === "two") return BATCH_TWO_KEYS;
  return [...BATCH_ONE_KEYS, ...BATCH_TWO_KEYS];
}

function getSeeds(batch: BatchId) {
  const keys = new Set(getKeys(batch));
  return DEFAULT_TASKS.filter((task) => keys.has(task.key));
}

function matchesTask(task: ScheduledTask, seed: TaskSeed) {
  return task.type === seed.type || task.name.toLowerCase() === seed.name.toLowerCase();
}

function isSent(status?: string | null) {
  return status === "sent" || Boolean(status?.startsWith("mock_sent"));
}

async function ensureTask(userId: string, existingTasks: ScheduledTask[], seed: TaskSeed) {
  const existing = existingTasks.find((task) => matchesTask(task, seed));
  if (existing) return existing;

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

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await requireCurrentUser();
    const body = await request.json().catch(() => ({})) as { batch?: string };
    const batch = body.batch === "two" ? "two" : body.batch === "all" ? "all" : "one";
    const seeds = getSeeds(batch);
    const existingTasks = await listScheduledTasks({ userId: user.id });

    const results = [];
    let sentCount = 0;
    let failedCount = 0;
    let createdCount = 0;

    for (const seed of seeds) {
      try {
        const before = existingTasks.length;
        const task = await ensureTask(user.id, existingTasks, seed);
        if (!existingTasks.find((item) => item.id === task.id)) existingTasks.push(task);
        if (existingTasks.length > before) createdCount += 1;

        const result = await runTaskNow(task.id, { userId: user.id, forceTelegram: true });
        const telegramStatus = result?.taskRun.telegramStatus ?? "not_run";
        const status = result?.taskRun.status ?? "not_found";
        if (isSent(telegramStatus)) sentCount += 1;
        if (!result || status === "failed" || telegramStatus.includes("failed")) failedCount += 1;

        results.push({
          taskId: task.id,
          taskName: task.name,
          taskType: task.type,
          status,
          telegramStatus,
          priorityScore: result?.taskRun.priorityScore ?? null,
          runId: result?.taskRun.id ?? null,
        });
      } catch (error) {
        failedCount += 1;
        results.push({
          taskId: null,
          taskName: seed.name,
          taskType: seed.type,
          status: "failed",
          telegramStatus: "failed_batch_error",
          priorityScore: null,
          runId: null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return ok(
      {
        batch,
        summary: {
          requestedCount: seeds.length,
          sentCount,
          failedCount,
          createdCount,
        },
        results,
      },
      { requestId },
    );
  } catch (error) {
    return fail(error, requestId);
  }
}
