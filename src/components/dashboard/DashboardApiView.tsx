"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { clampScore, formatDateTime } from "@/lib/utils";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";

export function DashboardApiView() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState("Run my Daily Brief now");
  const [message, setMessage] = useState("AI Command Box พร้อมเชื่อม API แล้ว");
  const [isCommandRunning, setIsCommandRunning] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [taskData, runData, notificationData] = await Promise.all([
        apiRequest<ScheduledTask[]>("/api/scheduled-tasks"),
        apiRequest<TaskRun[]>("/api/task-runs"),
        apiRequest<WebNotification[]>("/api/notifications"),
      ]);

      setTasks(taskData);
      setRuns(runData);
      setNotifications(notificationData);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const latestRun = runs[0] ?? null;
  const activeTasks = tasks.filter((task) => task.isActive).slice(0, 4);
  const activeCount = tasks.filter((task) => task.status === "Active").length;
  const runningCount = tasks.filter((task) => task.status === "Running").length;
  const failedCount = tasks.filter((task) => task.status === "Failed").length;
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const latestPriority = Math.max(...runs.map((run) => run.priorityScore), 0);

  const summaryCards = [
    { label: "Active Tasks", value: activeCount, hint: `${runningCount} running now`, tone: "green" as const, icon: "⏱" },
    { label: "Latest Priority", value: `${latestPriority}/100`, hint: "from latest task runs", tone: "purple" as const, icon: "◎" },
    { label: "Unread Alerts", value: unreadCount, hint: "notifications from API", tone: "blue" as const, icon: "●" },
    { label: "Failed Tasks", value: failedCount, hint: failedCount > 0 ? "needs review" : "healthy", tone: failedCount > 0 ? ("red" as const) : ("green" as const), icon: "!" },
  ];

  const latestNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);
  const latestRuns = useMemo(() => runs.slice(0, 3), [runs]);

  async function handleCommand() {
    const text = command.trim();

    if (!text) {
      setMessage("กรุณาพิมพ์คำสั่งก่อน เช่น Run my Daily Brief now");
      return;
    }

    const dailyBrief = tasks.find((task) => task.type === "Daily Brief" || task.name.toLowerCase().includes("daily"));

    if (!dailyBrief) {
      setMessage("ยังไม่มี Daily Brief task ให้รัน ลองสร้าง task ก่อน");
      return;
    }

    setIsCommandRunning(true);
    setMessage(`กำลังส่งคำสั่งไป API: ${text}`);

    try {
      await apiRequest(`/api/scheduled-tasks/${dailyBrief.id}/run-now`, { method: "POST" });
      setMessage(`Run Now สำเร็จผ่าน API: ${dailyBrief.name}`);
      await loadDashboard();
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setIsCommandRunning(false);
    }
  }

  if (isLoading) return <LoadingState title="Loading dashboard" description="กำลังดึงข้อมูล Dashboard จาก API routes" />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 17 API-connected UI</Badge>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              DailyHub AI Dashboard ต่อ API จริงแล้ว
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              หน้านี้ fetch ข้อมูลจาก /api/scheduled-tasks, /api/task-runs และ /api/notifications แทนการ import mock-data โดยตรง พร้อมใช้กับ Supabase จาก Phase 12–16
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="blue">API Fetch</Badge>
              <Badge tone="green">Supabase Ready</Badge>
              <Badge tone="purple">OpenAI Ready</Badge>
              <Badge tone="gray">Telegram Ready</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Latest GPT Run</p>
          <h2 className="mt-3 text-xl font-black text-white">{latestRun?.gptOutput.title ?? "No result yet"}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
            {latestRun?.gptOutput.summary ?? "ยังไม่มีผลลัพธ์จาก GPT"}
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Priority</span>
              <span className="text-2xl font-black text-cyan-100">{latestRun?.priorityScore ?? 0}/100</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Last run: {latestRun ? formatDateTime(latestRun.startedAt) : "-"}</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{card.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{card.hint}</p>
              </div>
              <Badge tone={card.tone}>{card.icon}</Badge>
            </div>
          </Card>
        ))}
      </section>

      <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.06] p-5 sm:p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">AI Command Box</p>
            <h2 className="mt-3 text-2xl font-black text-white">สั่ง Run Task ผ่าน API</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">ตอนนี้คำสั่ง Run Daily Brief จะเรียก /api/scheduled-tasks/:id/run-now จริง</p>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input value={command} onChange={(event) => setCommand(event.target.value)} />
              <Button disabled={isCommandRunning} onClick={handleCommand} type="button">
                {isCommandRunning ? "Running..." : "Send Command"}
              </Button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">{message}</div>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-200">Active Scheduled Tasks</p>
            <h2 className="mt-1 text-2xl font-black text-white">งานที่เปิดใช้งานอยู่</h2>
          </div>
          <Button variant="secondary" onClick={loadDashboard} type="button">Refresh</Button>
        </div>
        {activeTasks.length === 0 ? (
          <EmptyState title="No active tasks" description="ลองสร้าง Scheduled Task ใหม่หรือเปิดใช้งาน task ที่ paused อยู่" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {activeTasks.map((task) => (
              <Card key={task.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Badge tone={task.status === "Running" ? "purple" : task.status === "Failed" ? "red" : "green"}>{task.status}</Badge>
                    <h3 className="mt-4 line-clamp-2 text-base font-black text-white">{task.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{task.type}</p>
                  </div>
                  <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-cyan-100">{task.scheduleType}</span>
                </div>
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                  <p>Last Run: {formatDateTime(task.lastRunAt)}</p>
                  <p>Next Run: {formatDateTime(task.nextRunAt)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Latest GPT Results</p>
          <h2 className="mt-1 text-2xl font-black text-white">ผลลัพธ์ล่าสุดจาก API</h2>
        </div>
        {latestRuns.length === 0 ? (
          <EmptyState title="No GPT results" description="กด Run Now เพื่อสร้าง task_runs ผ่าน API" />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {latestRuns.map((run) => {
              const score = clampScore(run.priorityScore);
              return (
                <Card key={run.id} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "purple"}>{run.status}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(run.startedAt)}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-white">{run.gptOutput.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{run.gptOutput.summary}</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500" style={{ width: `${score}%` }} />
                  </div>
                  <Link href={`/task-results/${run.id}`} className="mt-5 inline-flex text-sm font-bold text-cyan-200 hover:text-cyan-100">
                    Open Result →
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-violet-200">Notifications</p>
          <h2 className="mt-1 text-2xl font-black text-white">แจ้งเตือนล่าสุดจาก API</h2>
        </div>
        {latestNotifications.length === 0 ? (
          <EmptyState title="No notifications" description="เมื่อ task run สำเร็จ ระบบจะสร้าง notification ผ่าน API" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {latestNotifications.map((notification) => (
              <Card key={notification.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={notification.isRead ? "gray" : "blue"}>{notification.isRead ? "Read" : "Unread"}</Badge>
                      {notification.priorityScore >= 80 && <Badge tone="red">Important</Badge>}
                      <Badge tone="purple">{notification.type}</Badge>
                    </div>
                    <h3 className="mt-4 text-base font-black text-white">{notification.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{notification.summary}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-cyan-100">{notification.priorityScore}</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">score</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
