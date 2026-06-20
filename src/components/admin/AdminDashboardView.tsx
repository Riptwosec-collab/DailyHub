"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import type { AdminMetrics } from "@/types/admin";
import { AdminStatCard } from "./AdminStatCard";
import { UsageLimitCard } from "./UsageLimitCard";

export function AdminDashboardView() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    try {
      setIsLoading(true);
      setError(null);
      setMetrics(await apiFetch<AdminMetrics>("/api/admin/metrics"));
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState title="Loading admin dashboard" description="กำลังโหลด metrics, usage และ logs" />;
  if (error || !metrics) return <ErrorState title="Admin dashboard error" description={error ?? "ไม่สามารถโหลดข้อมูลได้"} onRetry={load} />;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 19 Admin</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Admin / Usage Dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              ดูสถานะระบบ, task usage, OpenAI/Telegram mode, failed runs, audit logs และ health overview ของ DailyHub AI
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/admin/usage"><Button variant="secondary">Usage</Button></Link>
              <Link href="/admin/logs"><Button variant="secondary">Logs</Button></Link>
              <Link href="/admin/errors"><Button variant="secondary">Errors</Button></Link>
              <Button onClick={load} type="button">Refresh</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">System Health</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={metrics.health.supabaseEnabled ? "green" : "gray"}>Supabase: {metrics.health.supabaseEnabled ? "real" : "mock"}</Badge>
            <Badge tone={metrics.health.openAiMode === "real" ? "green" : "gray"}>OpenAI: {metrics.health.openAiMode}</Badge>
            <Badge tone={metrics.health.telegramMode === "real" ? "green" : "gray"}>Telegram: {metrics.health.telegramMode}</Badge>
            <Badge tone={metrics.health.schedulerEnabled ? "green" : "gray"}>Scheduler: {metrics.health.schedulerEnabled ? "on" : "off"}</Badge>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tasks" value={metrics.totals.tasks} hint={`${metrics.totals.activeTasks} active`} />
        <AdminStatCard label="Task Runs" value={metrics.totals.taskRuns} hint={`${metrics.totals.failedRuns} failed`} />
        <AdminStatCard label="Notifications" value={metrics.totals.notifications} hint={`${metrics.totals.unreadNotifications} unread`} />
        <AdminStatCard label="Audit Logs" value={metrics.totals.auditLogs} hint="latest memory logs" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <UsageLimitCard item={metrics.usage.runNowToday} />
        <UsageLimitCard item={metrics.usage.openAiToday} />
        <UsageLimitCard item={metrics.usage.telegramToday} />
        <UsageLimitCard item={metrics.usage.taskCount} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Latest Failed / Error Signals</h2>
          <div className="mt-4 space-y-3">
            {metrics.latest.runs.filter((run) => run.status === "failed").length === 0 ? (
              <p className="text-sm text-slate-400">No recent failed runs.</p>
            ) : (
              metrics.latest.runs.filter((run) => run.status === "failed").map((run) => (
                <div key={run.id} className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
                  <p className="font-bold text-rose-100">{run.gptOutput.title}</p>
                  <p className="mt-1 text-xs text-rose-100/70">{run.errorMessage}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Latest Audit Logs</h2>
          <div className="mt-4 space-y-3">
            {metrics.latest.auditLogs.length === 0 ? (
              <p className="text-sm text-slate-400">No audit logs yet.</p>
            ) : (
              metrics.latest.auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{log.action}</p>
                    <Badge tone={log.level === "error" ? "red" : log.level === "warn" ? "purple" : "blue"}>{log.level}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
