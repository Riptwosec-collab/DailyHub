"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import type { AdminMetrics } from "@/types/admin";
import { AdminStatCard } from "./AdminStatCard";
import { UsageLimitCard } from "./UsageLimitCard";

const copy = {
  th: {
    loadingTitle: "กำลังโหลดแดชบอร์ดแอดมิน",
    loadingDesc: "กำลังโหลด metrics, usage และ logs",
    errorTitle: "แดชบอร์ดแอดมินมีปัญหา",
    errorDesc: "ไม่สามารถโหลดข้อมูลได้",
    badge: "ศูนย์ผู้ดูแลระบบ",
    title: "แดชบอร์ดแอดมิน / การใช้งาน",
    desc: "ดูสถานะระบบ, task usage, โหมด OpenAI/Telegram, failed runs, audit logs และ health overview ของ NimbusDaily",
    usage: "การใช้งาน",
    logs: "Logs",
    errors: "Errors",
    refresh: "รีเฟรช",
    health: "สุขภาพระบบ",
    real: "จริง",
    mock: "จำลอง",
    on: "เปิด",
    off: "ปิด",
    tasks: "งาน",
    active: "กำลังใช้งาน",
    taskRuns: "รอบรัน",
    failed: "ล้มเหลว",
    notifications: "การแจ้งเตือน",
    unread: "ยังไม่อ่าน",
    auditLogs: "Audit Logs",
    latestMemory: "logs ล่าสุดใน memory",
    failedSignals: "สัญญาณล้มเหลว / Error ล่าสุด",
    noFailed: "ยังไม่มี failed run ล่าสุด",
    latestAudit: "Audit Logs ล่าสุด",
    noAudit: "ยังไม่มี audit logs",
  },
  en: {
    loadingTitle: "Loading admin dashboard",
    loadingDesc: "Loading metrics, usage, and logs",
    errorTitle: "Admin dashboard error",
    errorDesc: "Unable to load data",
    badge: "Admin center",
    title: "Admin / Usage Dashboard",
    desc: "View system status, task usage, OpenAI/Telegram mode, failed runs, audit logs, and NimbusDaily health overview.",
    usage: "Usage",
    logs: "Logs",
    errors: "Errors",
    refresh: "Refresh",
    health: "System Health",
    real: "real",
    mock: "mock",
    on: "on",
    off: "off",
    tasks: "Tasks",
    active: "active",
    taskRuns: "Task Runs",
    failed: "failed",
    notifications: "Notifications",
    unread: "unread",
    auditLogs: "Audit Logs",
    latestMemory: "latest memory logs",
    failedSignals: "Latest Failed / Error Signals",
    noFailed: "No recent failed runs.",
    latestAudit: "Latest Audit Logs",
    noAudit: "No audit logs yet.",
  },
} as const;

export function AdminDashboardView() {
  const { lang } = useLanguage();
  const text = copy[lang];
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

  useEffect(() => { void load(); }, []);

  if (isLoading) return <LoadingState title={text.loadingTitle} description={text.loadingDesc} />;
  if (error || !metrics) return <ErrorState title={text.errorTitle} description={error ?? text.errorDesc} onRetry={load} />;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="relative">
            <Badge tone="purple">{text.badge}</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">{text.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{text.desc}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/admin/usage"><Button variant="secondary">{text.usage}</Button></Link>
              <Link href="/admin/logs"><Button variant="secondary">{text.logs}</Button></Link>
              <Link href="/admin/errors"><Button variant="secondary">{text.errors}</Button></Link>
              <Button onClick={load} type="button">{text.refresh}</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">{text.health}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone={metrics.health.supabaseEnabled ? "green" : "gray"}>Supabase: {metrics.health.supabaseEnabled ? text.real : text.mock}</Badge>
            <Badge tone={metrics.health.openAiMode === "real" ? "green" : "gray"}>OpenAI: {metrics.health.openAiMode}</Badge>
            <Badge tone={metrics.health.telegramMode === "real" ? "green" : "gray"}>Telegram: {metrics.health.telegramMode}</Badge>
            <Badge tone={metrics.health.schedulerEnabled ? "green" : "gray"}>Scheduler: {metrics.health.schedulerEnabled ? text.on : text.off}</Badge>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={text.tasks} value={metrics.totals.tasks} hint={`${metrics.totals.activeTasks} ${text.active}`} />
        <AdminStatCard label={text.taskRuns} value={metrics.totals.taskRuns} hint={`${metrics.totals.failedRuns} ${text.failed}`} />
        <AdminStatCard label={text.notifications} value={metrics.totals.notifications} hint={`${metrics.totals.unreadNotifications} ${text.unread}`} />
        <AdminStatCard label={text.auditLogs} value={metrics.totals.auditLogs} hint={text.latestMemory} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <UsageLimitCard item={metrics.usage.runNowToday} />
        <UsageLimitCard item={metrics.usage.openAiToday} />
        <UsageLimitCard item={metrics.usage.telegramToday} />
        <UsageLimitCard item={metrics.usage.taskCount} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-white">{text.failedSignals}</h2>
          <div className="mt-4 space-y-3">
            {metrics.latest.runs.filter((run) => run.status === "failed").length === 0 ? (
              <p className="text-sm text-slate-400">{text.noFailed}</p>
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
          <h2 className="text-xl font-black text-white">{text.latestAudit}</h2>
          <div className="mt-4 space-y-3">
            {metrics.latest.auditLogs.length === 0 ? (
              <p className="text-sm text-slate-400">{text.noAudit}</p>
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
