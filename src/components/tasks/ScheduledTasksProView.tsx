"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask, ScheduledTaskStatus } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Card } from "@/components/ui/Card";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<string, string> = {
  "Daily Brief": "📰",
  "Email Monitor": "📧",
  "Sale Monitor": "🛒",
  "World Cup Recap": "⚽",
  "Weekend Long Read": "📚",
  "Concert Alerts": "🎵",
  "Weekend Ideas": "🎉",
  Custom: "⚙️",
};

const SCHEDULE_LABEL: Record<string, string> = {
  Daily: "ทุกวัน",
  Hourly: "ทุกชั่วโมง",
  Weekly: "ทุกสัปดาห์",
  Monthly: "ทุกเดือน",
  "One Time": "ครั้งเดียว",
  "Custom Cron": "กำหนดเอง",
};

const TEMPLATES = [
  { id: "daily-brief", name: "Daily Brief", emoji: "📰", desc: "สรุปข่าว/ข้อมูลประจำวัน ส่ง Dashboard + Telegram", cron: "0 1 * * *", type: "Daily Brief" },
  { id: "email-monitor", name: "Email Monitor", emoji: "📧", desc: "ตรวจอีเมลสำคัญ แจ้งเมื่อพบอีเมลที่ควรดู", cron: "0 9 * * *", type: "Email Monitor" },
  { id: "sale-monitor", name: "Sale Monitor", emoji: "🛒", desc: "ติดตามโปรลดราคา แจ้งเมื่อมีสินค้าราคาดี", cron: "0 10 * * *", type: "Sale Monitor" },
  { id: "football-recap", name: "Football Recap", emoji: "⚽", desc: "สรุปผลบอลและ World Cup recap หลังจบวันแข่งขัน", cron: "0 23 * * *", type: "World Cup Recap" },
  { id: "weekend-ideas", name: "Weekend Ideas", emoji: "🎉", desc: "แนะนำกิจกรรมหรือที่เที่ยวช่วงสุดสัปดาห์", cron: "0 9 * * 6", type: "Weekend Ideas" },
  { id: "weekend-long-read", name: "Weekend Long Read", emoji: "📚", desc: "หาเรื่องน่าอ่านยาวช่วงสุดสัปดาห์", cron: "0 10 * * 6", type: "Weekend Long Read" },
];

const FILTER_TABS = {
  th: [
    { label: "ทั้งหมด", value: "All" },
    { label: "🟢 ใช้งานอยู่", value: "Active" },
    { label: "🔵 กำลังรัน", value: "Running" },
    { label: "⏸ หยุดไว้", value: "Paused" },
    { label: "🔴 ล้มเหลว", value: "Failed" },
  ],
  en: [
    { label: "All", value: "All" },
    { label: "🟢 Active", value: "Active" },
    { label: "🔵 Running", value: "Running" },
    { label: "⏸ Paused", value: "Paused" },
    { label: "🔴 Failed", value: "Failed" },
  ],
} as const;

const copy = {
  th: {
    title: "งานอัตโนมัติ",
    desc: "จัดการงานอัตโนมัติ Daily Brief, Email Monitor, Sale Monitor และ Telegram Alert",
    testTelegram: "ทดสอบ Telegram",
    refresh: "รีเฟรช",
    createTask: "สร้างงาน",
    total: "ทั้งหมด",
    active: "ใช้งานอยู่",
    paused: "หยุดไว้",
    failed: "ล้มเหลว",
    running: "กำลังรัน",
    successRate: "อัตราสำเร็จ",
    nextTask: "งานถัดไป",
    retry: "ลองใหม่",
    loadFailed: "โหลดไม่สำเร็จ",
    emptyTitle: "ยังไม่มี Scheduled Tasks",
    emptyDesc: "สร้าง automation task แรกของคุณ เช่น Daily Brief, Email Monitor หรือ Telegram Alert",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    runNow: "Run Now",
    resume: "Resume",
    pause: "Pause",
    delete: "Delete",
    viewLogs: "View Logs",
    results: "ผลลัพธ์",
    retryAction: "ลองใหม่",
    runningAction: "กำลังรัน...",
    schedule: "ตารางเวลา",
    timezone: "เขตเวลา",
    lastRun: "รันล่าสุด",
    nextRun: "รันถัดไป",
    minPriority: "ความสำคัญขั้นต่ำ",
    failedHint: "งานล้มเหลวในการรันครั้งล่าสุด กดลองใหม่หรือดูบันทึก",
    taskLogs: "บันทึกงาน",
    close: "ปิด",
    noLogs: "ยังไม่มีบันทึกสำหรับงานนี้",
    started: "เริ่ม",
    duration: "ระยะเวลา",
    priority: "ความสำคัญ",
    showing: (count: number, total: number) => `แสดง ${count} จาก ${total} งาน`,
    failedCount: (count: number) => `${count} งานล้มเหลว`,
    hobbyTitle: "Vercel Hobby Plan",
    hobbyDesc: "Cron รองรับวันละครั้งเท่านั้น สำหรับงานรายชั่วโมงหรือถี่กว่า ใช้ Vercel Pro หรือ external scheduler เช่น cron-job.org",
    chooseTemplate: "เลือกเทมเพลต",
    createNewTask: "สร้างงานใหม่",
    customTask: "งานกำหนดเอง",
    customTaskDesc: "กำหนดทุกอย่างเอง",
    runStarting: (name: string) => `กำลังรัน ${name}...`,
    runSuccess: "Run Now สำเร็จ",
    runFailed: "Run Now ล้มเหลว",
    pauseTitle: (name: string) => `หยุด "${name}"?`,
    pauseDesc: "งานนี้จะไม่รันอัตโนมัติจนกว่าจะ Resume ใหม่",
    toggleSuccess: (resume: boolean) => resume ? "Resume สำเร็จ" : "Pause สำเร็จ",
    actionFailed: "ไม่สำเร็จ",
    deleteTitle: (name: string) => `ลบ "${name}"?`,
    deleteDesc: "การกระทำนี้ไม่สามารถยกเลิกได้ task runs และ notifications ทั้งหมดจะถูกลบด้วย",
    deleteSuccess: "ลบสำเร็จ",
    deleteFailed: "ลบไม่สำเร็จ",
    telegramSending: "กำลังส่ง Telegram test...",
    telegramSuccess: "Telegram test ส่งสำเร็จ",
    telegramCheck: "เช็คมือถือได้เลย",
    telegramFailed: "Telegram test ล้มเหลว",
  },
  en: {
    title: "Scheduled Tasks",
    desc: "Manage Daily Brief, Email Monitor, Sale Monitor, and Telegram Alert automations.",
    testTelegram: "Test Telegram",
    refresh: "Refresh",
    createTask: "Create Task",
    total: "Total",
    active: "Active",
    paused: "Paused",
    failed: "Failed",
    running: "Running",
    successRate: "Success Rate",
    nextTask: "Next task",
    retry: "Retry",
    loadFailed: "Loading failed",
    emptyTitle: "No Scheduled Tasks yet",
    emptyDesc: "Create your first automation task, such as Daily Brief, Email Monitor, or Telegram Alert.",
    cancel: "Cancel",
    confirm: "Confirm",
    runNow: "Run Now",
    resume: "Resume",
    pause: "Pause",
    delete: "Delete",
    viewLogs: "View Logs",
    results: "Results",
    retryAction: "Retry",
    runningAction: "Running...",
    schedule: "Schedule",
    timezone: "Timezone",
    lastRun: "Last run",
    nextRun: "Next run",
    minPriority: "Min Priority",
    failedHint: "The latest run failed. Retry the task or view logs.",
    taskLogs: "Task Logs",
    close: "Close",
    noLogs: "No logs for this task yet",
    started: "Started",
    duration: "Duration",
    priority: "Priority",
    showing: (count: number, total: number) => `Showing ${count} of ${total} tasks`,
    failedCount: (count: number) => `${count} tasks failed`,
    hobbyTitle: "Vercel Hobby Plan",
    hobbyDesc: "Cron runs once per day on the Hobby plan. For hourly or more frequent schedules, use Vercel Pro or an external scheduler such as cron-job.org.",
    chooseTemplate: "Choose Template",
    createNewTask: "Create New Task",
    customTask: "Custom Task",
    customTaskDesc: "Configure everything yourself",
    runStarting: (name: string) => `Running ${name}...`,
    runSuccess: "Run Now succeeded",
    runFailed: "Run Now failed",
    pauseTitle: (name: string) => `Pause "${name}"?`,
    pauseDesc: "This task will not run automatically until you resume it.",
    toggleSuccess: (resume: boolean) => resume ? "Resume succeeded" : "Pause succeeded",
    actionFailed: "Action failed",
    deleteTitle: (name: string) => `Delete "${name}"?`,
    deleteDesc: "This cannot be undone. Task runs and notifications will also be deleted.",
    deleteSuccess: "Deleted",
    deleteFailed: "Delete failed",
    telegramSending: "Sending Telegram test...",
    telegramSuccess: "Telegram test sent",
    telegramCheck: "Check your phone.",
    telegramFailed: "Telegram test failed",
  },
} as const;

type ScheduledTasksCopy = (typeof copy)[keyof typeof copy];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ScheduledTasksProView() {
  const { pushToast } = useToast();
  const { lang } = useLanguage();
  const text = copy[lang];
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [drawerTask, setDrawerTask] = useState<ScheduledTask | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [telegramBusy, setTelegramBusy] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ScheduledTask[]>("/api/scheduled-tasks");
      setTasks(data);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const setBusy = (id: string, busy: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });

  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    return tasks.filter((t) => {
      const matchTab = activeTab === "All" || t.status === activeTab;
      const matchSearch = !kw || [t.name, t.type, t.status, t.scheduleType].join(" ").toLowerCase().includes(kw);
      return matchTab && matchSearch;
    });
  }, [tasks, activeTab, search]);

  const total = tasks.length;
  const activeCount = tasks.filter((t) => t.status === "Active").length;
  const pausedCount = tasks.filter((t) => t.status === "Paused").length;
  const failedCount = tasks.filter((t) => t.status === "Failed").length;
  const runningCount = tasks.filter((t) => t.status === "Running").length;
  const successRate = total ? Math.round(((activeCount + runningCount) / total) * 100) : 0;
  const nextTask = [...tasks].filter((t) => t.nextRunAt && t.isActive).sort((a, b) => (a.nextRunAt! < b.nextRunAt! ? -1 : 1))[0];

  async function handleRunNow(task: ScheduledTask) {
    setBusy(task.id, true);
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: "Running" as ScheduledTaskStatus } : t));
    pushToast({ title: `⚡ ${text.runStarting(task.name)}`, tone: "info" });
    try {
      const result = await apiFetch<{ task: ScheduledTask }>(`/api/scheduled-tasks/${task.id}/run-now`, { method: "POST" });
      setTasks((prev) => prev.map((t) => t.id === task.id ? result.task : t));
      pushToast({ title: `✅ ${text.runSuccess}`, description: task.name, tone: "success" });
    } catch (err) {
      pushToast({ title: `❌ ${text.runFailed}`, description: getFriendlyApiError(err), tone: "error" });
      await loadTasks();
    } finally {
      setBusy(task.id, false);
    }
  }

  function confirmPause(task: ScheduledTask) {
    if (task.status === "Paused") { void handleToggle(task); return; }
    setConfirm({
      open: true,
      title: text.pauseTitle(task.name),
      description: text.pauseDesc,
      onConfirm: () => { setConfirm((c) => ({ ...c, open: false })); void handleToggle(task); },
    });
  }

  async function handleToggle(task: ScheduledTask) {
    const resume = task.status === "Paused";
    setBusy(task.id, true);
    try {
      const updated = await apiFetch<ScheduledTask>(`/api/scheduled-tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: resume ? "Active" : "Paused", isActive: resume, is_active: resume }),
      });
      setTasks((prev) => prev.map((t) => t.id === task.id ? updated : t));
      pushToast({ title: resume ? `▶️ ${text.toggleSuccess(true)}` : `⏸ ${text.toggleSuccess(false)}`, description: task.name, tone: "success" });
    } catch (err) {
      pushToast({ title: `❌ ${text.actionFailed}`, description: getFriendlyApiError(err), tone: "error" });
    } finally {
      setBusy(task.id, false);
    }
  }

  function confirmDelete(task: ScheduledTask) {
    setConfirm({
      open: true,
      title: text.deleteTitle(task.name),
      description: text.deleteDesc,
      onConfirm: () => { setConfirm((c) => ({ ...c, open: false })); void handleDelete(task); },
    });
  }

  async function handleDelete(task: ScheduledTask) {
    setBusy(task.id, true);
    try {
      await apiFetch(`/api/scheduled-tasks/${task.id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      pushToast({ title: `🗑️ ${text.deleteSuccess}`, description: task.name, tone: "success" });
    } catch (err) {
      pushToast({ title: `❌ ${text.deleteFailed}`, description: getFriendlyApiError(err), tone: "error" });
    } finally {
      setBusy(task.id, false);
    }
  }

  async function handleTelegramTest() {
    setTelegramBusy(true);
    pushToast({ title: `📤 ${text.telegramSending}`, tone: "info" });
    try {
      await apiFetch("/api/telegram/test", { method: "POST", body: JSON.stringify({ message: "DailyHub — Telegram test ✅" }) });
      pushToast({ title: `✅ ${text.telegramSuccess}`, description: text.telegramCheck, tone: "success" });
    } catch (err) {
      pushToast({ title: `❌ ${text.telegramFailed}`, description: getFriendlyApiError(err), tone: "error" });
    } finally {
      setTelegramBusy(false);
    }
  }

  if (isLoading) return <LoadingSkeleton />;

  if (error)
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-300/30 bg-rose-300/10 text-4xl">⚠️</div>
        <div>
          <p className="text-lg font-black text-white">{text.loadFailed}</p>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
        </div>
        <button onClick={loadTasks} type="button" className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">↻ {text.retry}</button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱</span>
            <h1 className="text-2xl font-black text-white sm:text-3xl">{text.title}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">{text.desc}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            disabled={telegramBusy}
            onClick={() => void handleTelegramTest()}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-violet-300/30 bg-violet-300/10 px-4 py-2.5 text-sm font-bold text-violet-100 transition hover:bg-violet-300/15 disabled:opacity-50"
          >
            {telegramBusy ? "⏳" : "✈"} {text.testTelegram}
          </button>
          <button onClick={loadTasks} type="button" className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10">↻ {text.refresh}</button>
          <button
            onClick={() => setShowTemplates(true)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90"
          >
            + {text.createTask}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label={text.total} value={total} emoji="□" color="slate" />
        <SummaryCard label={text.active} value={activeCount} emoji="●" color="emerald" />
        <SummaryCard label={text.paused} value={pausedCount} emoji="Ⅱ" color="amber" />
        <SummaryCard label={text.failed} value={failedCount} emoji="!" color="rose" />
        <SummaryCard label={text.running} value={runningCount} emoji="●" color="violet" />
        <SummaryCard label={text.successRate} value={`${successRate}%`} emoji="%" color="cyan" />
      </div>

      {/* Next Task Banner */}
      {nextTask && (
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-sm">
          <span className="text-base">⏰</span>
          <span className="text-slate-300">
            {text.nextTask}: <span className="font-bold text-white">{nextTask.name}</span>
            {" — "}
            <span className="text-cyan-300">{nextTask.nextRunAt ? formatDateTime(nextTask.nextRunAt, lang) : "-"}</span>
          </span>
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหา task ตามชื่อ, ประเภท, สถานะ..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_TABS[lang].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
              className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.value
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{text.showing(filtered.length, total)}</span>
        {failedCount > 0 && <span className="font-bold text-rose-300">⚠️ {text.failedCount(failedCount)}</span>}
      </div>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <EmptyState onCreate={() => setShowTemplates(true)} title={text.emptyTitle} description={text.emptyDesc} buttonLabel={text.createTask} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCardPro
              key={task.id}
              task={task}
              isBusy={busyIds.has(task.id)}
              onRunNow={() => void handleRunNow(task)}
              onTogglePause={() => confirmPause(task)}
              onDelete={() => confirmDelete(task)}
              onViewLogs={() => setDrawerTask(task)}
              text={text}
              lang={lang}
            />
          ))}
        </div>
      )}

      {/* Vercel Hobby Warning */}
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-200">
        <p className="font-bold">⚠️ {text.hobbyTitle}</p>
        <p className="mt-1 text-amber-200/70">{text.hobbyDesc}</p>
      </div>

      {drawerTask && <LogDrawer task={drawerTask} onClose={() => setDrawerTask(null)} text={text} lang={lang} />}
      {showTemplates && <TemplateModal onClose={() => setShowTemplates(false)} text={text} />}
      {confirm.open && (
        <ConfirmModal
          title={confirm.title}
          description={confirm.description}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
          cancelLabel={text.cancel}
          confirmLabel={text.confirm}
        />
      )}
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, emoji, color }: {
  label: string; value: number | string; emoji: string;
  color: "slate" | "emerald" | "amber" | "rose" | "violet" | "cyan";
}) {
  const colors = {
    slate: "border-slate-300/20 bg-slate-300/[0.06] text-slate-100",
    emerald: "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100",
    amber: "border-amber-300/20 bg-amber-300/[0.08] text-amber-100",
    rose: "border-rose-300/20 bg-rose-300/[0.08] text-rose-100",
    violet: "border-violet-300/20 bg-violet-300/[0.08] text-violet-100",
    cyan: "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-100",
  }[color];
  return (
    <div className={`rounded-2xl border p-3 ${colors}`}>
      <p className="text-lg">{emoji}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}

// ─── Task Card Pro ────────────────────────────────────────────────────────────

function TaskCardPro({ task, isBusy, onRunNow, onTogglePause, onDelete, onViewLogs, text, lang }: {
  task: ScheduledTask; isBusy: boolean;
  onRunNow: () => void; onTogglePause: () => void;
  onDelete: () => void; onViewLogs: () => void;
  text: ScheduledTasksCopy; lang: "th" | "en";
}) {
  const emoji = TYPE_EMOJI[task.type] ?? "⚙️";
  const scheduleLabel = SCHEDULE_LABEL[task.scheduleType] ?? task.scheduleType;
  const isFailed = task.status === "Failed";
  const isPaused = task.status === "Paused";
  const isRunning = task.status === "Running";

  const statusStyle: Record<ScheduledTaskStatus, string> = {
    Active: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    Running: "border-violet-300/30 bg-violet-300/10 text-violet-200",
    Paused: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    Failed: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  };
  const statusDot: Record<ScheduledTaskStatus, string> = {
    Active: "bg-emerald-400",
    Running: "bg-violet-400 animate-pulse",
    Paused: "bg-amber-400",
    Failed: "bg-rose-400",
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="font-black text-white leading-tight">{task.name}</p>
            <p className="text-xs text-slate-500">{task.type}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle[task.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[task.status]}`} />
          {task.status}
        </span>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">{text.schedule}</span>
          <span className="font-semibold text-slate-300">{scheduleLabel}</span>
        </div>
        {task.cronExpression && (
          <div className="flex justify-between">
            <span className="text-slate-500">Cron</span>
            <code className="font-mono text-cyan-300">{task.cronExpression}</code>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">{text.timezone}</span>
          <span className="text-slate-400">{task.timezone}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
          <p className="text-slate-500">{text.lastRun}</p>
          <p className="mt-0.5 font-semibold text-slate-300">{task.lastRunAt ? formatDateTime(task.lastRunAt, lang) : "—"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
          <p className="text-slate-500">{text.nextRun}</p>
          <p className={`mt-0.5 font-semibold ${task.isActive && task.nextRunAt ? "text-cyan-300" : "text-slate-500"}`}>
            {task.nextRunAt && task.isActive ? formatDateTime(task.nextRunAt, lang) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {task.outputChannels.map((ch) => (
          <span key={ch} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            {ch === "Send Telegram" ? "✈️" : ch === "Save to Web Dashboard" ? "🖥" : "🔔"} {ch}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{text.minPriority}</span>
        <span className="font-bold text-slate-300">{task.minPriorityScore}/100</span>
      </div>

      {isFailed && (
        <div className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-300">
          ❌ {text.failedHint}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={isBusy}
          onClick={onRunNow}
          type="button"
          className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 py-2.5 text-sm font-black text-white shadow-md shadow-cyan-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy && isRunning ? <><span className="animate-spin">⚙️</span> {text.runningAction}</> : isFailed ? `🔄 ${text.retryAction}` : `⚡ ${text.runNow}`}
        </button>
        <button disabled={isBusy} onClick={onTogglePause} type="button" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 disabled:opacity-50">
          {isPaused ? `▶️ ${text.resume}` : `⏸ ${text.pause}`}
        </button>
        <button onClick={onViewLogs} type="button" className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10">
          📋 {text.viewLogs}
        </button>
        <Link href={`/task-results?task_id=${task.id}`} className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10">
          📊 {text.results}
        </Link>
        <button disabled={isBusy} onClick={onDelete} type="button" className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-300/10 disabled:opacity-50">
          🗑️ {text.delete}
        </button>
      </div>
    </Card>
  );
}

// ─── Log Drawer ───────────────────────────────────────────────────────────────

function LogDrawer({ task, onClose, text, lang }: { task: ScheduledTask; onClose: () => void; text: ScheduledTasksCopy; lang: "th" | "en" }) {
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<TaskRun[]>(`/api/task-runs?task_id=${task.id}`);
        setRuns(data);
      } catch { setRuns([]); }
      finally { setLoading(false); }
    })();
  }, [task.id]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const statusColor: Record<string, string> = {
    success: "text-emerald-300", failed: "text-rose-300", running: "text-violet-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <button aria-label="Close" className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} type="button" />
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs text-slate-500">{text.taskLogs}</p>
            <p className="font-black text-white">{TYPE_EMOJI[task.type] ?? "⚙️"} {task.name}</p>
          </div>
          <button onClick={onClose} type="button" className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white">✕ {text.close}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />)}
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">📭</span>
              <p className="text-slate-400">{text.noLogs}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => {
                const duration = run.startedAt && run.finishedAt
                  ? `${((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s`
                  : "—";
                return (
                  <div key={run.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-bold ${statusColor[run.status] ?? "text-slate-300"}`}>
                        {run.status === "success" ? "✅" : run.status === "failed" ? "❌" : "🔄"} {run.status}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{run.id.slice(-8)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-slate-500">
                      <span>{text.started}: <span className="text-slate-300">{formatDateTime(run.startedAt, lang)}</span></span>
                      <span>{text.duration}: <span className="text-slate-300">{duration}</span></span>
                      <span>{text.priority}: <span className="text-slate-300">{run.priorityScore}/100</span></span>
                      <span>Telegram: <span className={run.telegramStatus === "sent" ? "text-emerald-300" : "text-slate-400"}>{run.telegramStatus}</span></span>
                    </div>
                    {run.gptOutput?.summary && (
                      <p className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-xs text-slate-300 leading-5">{run.gptOutput.summary}</p>
                    )}
                    {run.errorMessage && (
                      <p className="mt-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-2.5 text-xs text-rose-300">{run.errorMessage}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Template Modal ───────────────────────────────────────────────────────────

function TemplateModal({ onClose, text }: { onClose: () => void; text: ScheduledTasksCopy }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} type="button" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-xs text-slate-500">{text.chooseTemplate}</p>
            <p className="font-black text-white text-lg">{text.createNewTask}</p>
          </div>
          <button onClick={onClose} type="button" className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/10">✕</button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((tpl) => (
              <Link
                key={tpl.id}
                href={`/scheduled-tasks/create?template=${tpl.id}`}
                onClick={onClose}
                className="group flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06]"
              >
                <span className="text-2xl">{tpl.emoji}</span>
                <div>
                  <p className="font-black text-white text-sm group-hover:text-cyan-100">{tpl.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{tpl.desc}</p>
                  <code className="mt-1.5 block text-[10px] font-mono text-cyan-400">{tpl.cron}</code>
                </div>
              </Link>
            ))}
            <Link
              href="/scheduled-tasks/create"
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
            >
              <span className="text-2xl">⚙️</span>
              <div>
                <p className="font-bold">{text.customTask}</p>
                <p className="text-xs">{text.customTaskDesc}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, description, onConfirm, onCancel, cancelLabel, confirmLabel }: {
  title: string; description: string; onConfirm: () => void; onCancel: () => void; cancelLabel: string; confirmLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Cancel" className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCancel} type="button" />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
        <p className="font-black text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400 leading-6">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} type="button" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10">{cancelLabel}</button>
          <button onClick={onConfirm} type="button" className="rounded-xl border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-300/15">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate, title, description, buttonLabel }: { onCreate: () => void; title: string; description: string; buttonLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-4xl">⏱</div>
      <div>
        <p className="text-lg font-black text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400 max-w-xs">{description}</p>
      </div>
      <button onClick={onCreate} type="button" className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-black text-white shadow-lg hover:opacity-90">
        + {buttonLabel}
      </button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]" />)}
      </div>
    </div>
  );
}
