"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import type { AuditLog } from "@/types/audit-log";

export function AdminLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setLogs(await apiFetch<AuditLog[]>("/api/audit-logs"));
      setError(null);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  if (loading) return <LoadingState title="Loading audit logs" description="กำลังโหลด logs" />;
  if (error) return <ErrorState title="Logs error" description={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Badge tone="purple">Phase 19 Logs</Badge>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">Audit Logs</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">ดู action log ของระบบ เช่น Run Now, Regenerate, Retry และ error events</p>
      </Card>

      <div className="grid gap-4">
        {logs.length === 0 ? <Card className="p-5 text-sm text-slate-400">No logs yet.</Card> : logs.map((log) => (
          <Card key={log.id} className="p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap gap-2"><Badge tone={log.level === "error" ? "red" : log.level === "warn" ? "purple" : "blue"}>{log.level}</Badge><Badge tone="gray">{log.entityType}</Badge></div>
                <h2 className="mt-3 text-lg font-black text-white">{log.action}</h2>
                <p className="mt-2 text-sm text-slate-400">{log.message}</p>
              </div>
              <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
