"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import type { AuditLog } from "@/types/audit-log";
import type { TaskRun } from "@/types/task-run";

interface AdminErrorsPayload {
  errorLogs: AuditLog[];
  failedRuns: TaskRun[];
}

export function AdminErrorsView() {
  const [payload, setPayload] = useState<AdminErrorsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setPayload(await apiFetch<AdminErrorsPayload>("/api/admin/errors"));
      setError(null);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState title="Loading error dashboard" description="กำลังโหลด failed runs และ error logs" />;
  if (error || !payload) return <ErrorState title="Error dashboard failed" description={error ?? "โหลดไม่ได้"} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Badge tone="red">Phase 20 Error QA</Badge>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">Errors & Failed Runs</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">ดู failed task trend และ error log เพื่อเตรียม production QA</p>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Failed Runs</h2>
          <div className="mt-4 space-y-3">
            {payload.failedRuns.length === 0 ? <p className="text-sm text-slate-400">No failed runs.</p> : payload.failedRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
                <p className="font-bold text-rose-100">{run.gptOutput.title}</p>
                <p className="mt-1 text-xs text-rose-100/70">{run.errorMessage ?? "No error message"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Error Logs</h2>
          <div className="mt-4 space-y-3">
            {payload.errorLogs.length === 0 ? <p className="text-sm text-slate-400">No error logs.</p> : payload.errorLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="font-bold text-white">{log.action}</p>
                <p className="mt-1 text-xs text-slate-400">{log.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
