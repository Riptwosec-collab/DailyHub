"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { ScheduledTask } from "@/types/scheduled-task";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

const TASK_DELAY_MS = 1500;
const BATCH_DELAY_MS = 3000;

type RunNowResponse = {
  taskRun?: {
    status?: string;
    telegramStatus?: string | null;
  };
};

type TaskSeed = {
  key: string;
  labelTh: string;
  labelEn: string;
  emoji: string;
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
    labelTh: "Morning Daily Brief",
    labelEn: "Morning Daily Brief",
    emoji: "📰",
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
    labelTh: "สินค้าใหม่/น่าสนใจทั่วโลก",
    labelEn: "Global Product Radar",
    emoji: "🌍",
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
    labelTh: "Weekend Ideas Generator",
    labelEn: "Weekend Ideas Generator",
    emoji: "🧭",
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
    labelTh: "Important Email Monitor",
    labelEn: "Important Email Monitor",
    emoji: "📧",
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
    labelTh: "Concert Alerts Near Me",
    labelEn: "Concert Alerts Near Me",
    emoji: "🎤",
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
    labelTh: "Football Recap Nightly",
    labelEn: "Football Recap Nightly",
    emoji: "⚽",
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
    labelTh: "Weekend Long Read Picker",
    labelEn: "Weekend Long Read Picker",
    emoji: "📚",
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

const FIXED_BATCHES = [
  {
    titleTh: "ปุ่มแรก",
    titleEn: "First button",
    subtitleTh: "Daily Brief / Product / Weekend Ideas / Email",
    subtitleEn: "Daily Brief / Product / Weekend Ideas / Email",
    keys: BATCH_ONE_KEYS,
  },
  {
    titleTh: "ปุ่มสอง",
    titleEn: "Second button",
    subtitleTh: "Concert / Football / Long Read",
    subtitleEn: "Concert / Football / Long Read",
    keys: BATCH_TWO_KEYS,
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBatchSeeds(keys: string[]) {
  return keys.map((key) => DEFAULT_TASKS.find((task) => task.key === key)).filter(Boolean) as TaskSeed[];
}

function matchesTask(task: ScheduledTask, seed: TaskSeed) {
  return task.type === seed.type || task.name.toLowerCase() === seed.name.toLowerCase();
}

function findTask(tasks: ScheduledTask[], seed: TaskSeed) {
  return tasks.find((task) => matchesTask(task, seed));
}

function sentStatus(status?: string | null) {
  return status === "sent" || Boolean(status?.startsWith("mock_sent"));
}

function taskLines(seeds: TaskSeed[], isTh: boolean) {
  return seeds.map((seed, index) => `${index + 1}. ${seed.emoji} ${isTh ? seed.labelTh : seed.labelEn}`);
}

export function RunBatchControls() {
  const { lang, t } = useLanguage();
  const isTh = lang === "th";
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState(t("batch_ready"));

  async function loadTasks() {
    const data = await apiRequest<ScheduledTask[]>("/api/scheduled-tasks");
    setTasks(data);
  }

  useEffect(() => {
    void loadTasks().catch((error) => setMessage(toErrorMessage(error)));
  }, []);

  useEffect(() => {
    if (!loading) setMessage(t("batch_ready"));
  }, [lang, loading, t]);

  const resolvedBatches = useMemo(
    () =>
      FIXED_BATCHES.map((batch) => {
        const seeds = getBatchSeeds(batch.keys);
        const found = seeds.map((seed) => ({ seed, task: findTask(tasks, seed) }));
        return { ...batch, seeds, found };
      }),
    [tasks],
  );

  const readyCount = resolvedBatches.flatMap((batch) => batch.found).filter((item) => item.task).length;

  async function createMissingTasks(seeds: TaskSeed[]) {
    const created: ScheduledTask[] = [];

    for (const seed of seeds) {
      const task = await apiRequest<ScheduledTask>("/api/scheduled-tasks", {
        method: "POST",
        body: JSON.stringify({
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
        }),
      });
      created.push(task);
      await delay(350);
    }

    return created;
  }

  async function ensureBatchTasks(seeds: TaskSeed[]) {
    const missing = seeds.filter((seed) => !findTask(tasks, seed));
    if (missing.length) {
      setMessage(isTh ? `กำลังเติม task ที่ขาด ${missing.length} รายการ...` : `Creating ${missing.length} missing task(s)...`);
      await createMissingTasks(missing);
      const latest = await apiRequest<ScheduledTask[]>("/api/scheduled-tasks");
      setTasks(latest);
      return seeds.map((seed) => findTask(latest, seed)).filter(Boolean) as ScheduledTask[];
    }

    return seeds.map((seed) => findTask(tasks, seed)).filter(Boolean) as ScheduledTask[];
  }

  async function runBatch(batchIndex: number) {
    const batch = resolvedBatches[batchIndex];
    if (!batch) return;
    const batchTitle = isTh ? batch.titleTh : batch.titleEn;

    setLoading(`batch-${batchIndex}`);
    setMessage(isTh ? `กำลังรัน ${batchTitle}...` : `Running ${batchTitle}...`);

    try {
      const runnableTasks = await ensureBatchTasks(batch.seeds);
      let sent = 0;
      let failed = 0;

      for (const [index, task] of runnableTasks.entries()) {
        try {
          const result = await apiRequest<RunNowResponse>(`/api/scheduled-tasks/${task.id}/run-now`, { method: "POST" });
          if (sentStatus(result.taskRun?.telegramStatus)) sent += 1;
          if (result.taskRun?.status === "failed" || result.taskRun?.telegramStatus?.includes("failed")) failed += 1;
        } catch {
          failed += 1;
        }

        if (index < runnableTasks.length - 1) await delay(TASK_DELAY_MS);
      }

      setMessage(isTh ? `${batchTitle} เสร็จแล้ว: ส่ง ${sent}/${batch.seeds.length}, ผิดพลาด ${failed}` : `${batchTitle} complete: sent ${sent}/${batch.seeds.length}, failed ${failed}`);
      await loadTasks();
    } catch (error) {
      setMessage(toErrorMessage(error));
    } finally {
      setLoading(null);
    }
  }

  async function runAllBatches() {
    setLoading("all");
    let sent = 0;
    let failed = 0;
    let expected = 0;

    try {
      for (const [index, batch] of resolvedBatches.entries()) {
        const batchTitle = isTh ? batch.titleTh : batch.titleEn;
        setMessage(isTh ? `กำลังรัน ${batchTitle} (${index + 1}/${resolvedBatches.length})...` : `Running ${batchTitle} (${index + 1}/${resolvedBatches.length})...`);
        const runnableTasks = await ensureBatchTasks(batch.seeds);
        expected += batch.seeds.length;

        for (const [taskIndex, task] of runnableTasks.entries()) {
          try {
            const result = await apiRequest<RunNowResponse>(`/api/scheduled-tasks/${task.id}/run-now`, { method: "POST" });
            if (sentStatus(result.taskRun?.telegramStatus)) sent += 1;
            if (result.taskRun?.status === "failed" || result.taskRun?.telegramStatus?.includes("failed")) failed += 1;
          } catch {
            failed += 1;
          }
          if (taskIndex < runnableTasks.length - 1) await delay(TASK_DELAY_MS);
        }

        if (index < resolvedBatches.length - 1) await delay(BATCH_DELAY_MS);
      }

      setMessage(isTh ? `รันครบ 2 ปุ่มแล้ว: ส่ง ${sent}/${expected}, ผิดพลาด ${failed}` : `Both buttons complete: sent ${sent}/${expected}, failed ${failed}`);
      await loadTasks();
    } catch (error) {
      setMessage(toErrorMessage(error));
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="relative overflow-hidden border-emerald-300/20 bg-emerald-300/[0.05] p-5 sm:p-6">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone="green">⚡ {t("batch_badge")}</Badge>
            <h2 className="mt-3 text-2xl font-black text-white">{t("batch_title")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{t("batch_desc")}</p>
          </div>
          <Button disabled={Boolean(loading)} onClick={() => void runAllBatches()} type="button">
            {loading === "all" ? t("batch_running") : `🚀 ${t("batch_run_all")}`}
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {resolvedBatches.map((batch, index) => {
            const foundCount = batch.found.filter((item) => item.task).length;
            const missingCount = batch.seeds.length - foundCount;
            const batchTitle = isTh ? batch.titleTh : batch.titleEn;
            return (
              <div key={batch.titleEn} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 shadow-2xl shadow-black/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{batchTitle}</p>
                    <h3 className="mt-1 text-lg font-black text-white">{isTh ? batch.subtitleTh : batch.subtitleEn}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {isTh ? `พร้อม ${foundCount}/${batch.seeds.length} หัวข้อ${missingCount ? ` · ขาด ${missingCount} ระบบจะเติมให้ตอนกดรัน` : ""}` : `Ready ${foundCount}/${batch.seeds.length} topic(s)${missingCount ? ` · missing ${missingCount}, will create before running` : ""}`}
                    </p>
                  </div>
                  <Button disabled={Boolean(loading)} onClick={() => void runBatch(index)} type="button" variant="secondary">
                    {loading === `batch-${index}` ? t("batch_running") : `▶ ${isTh ? "รัน" : "Run "}${batchTitle}`}
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm leading-6 text-slate-300">
                  {taskLines(batch.seeds, isTh).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
          {message} · {isTh ? `มี task ในระบบตอนนี้ ${readyCount}/7` : `Current tasks in system ${readyCount}/7`}
        </div>
      </div>
    </Card>
  );
}
