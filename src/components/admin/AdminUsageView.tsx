"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiFetch, getFriendlyApiError } from "@/lib/api-client";
import type { AdminUsageMetrics } from "@/types/usage";
import { UsageLimitCard } from "./UsageLimitCard";

export function AdminUsageView() {
  const [usage, setUsage] = useState<AdminUsageMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setUsage(await apiFetch<AdminUsageMetrics>("/api/admin/usage"));
      setError(null);
    } catch (err) {
      setError(getFriendlyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <LoadingState title="Loading usage" description="กำลังโหลด usage limit" />;
  if (error || !usage) return <ErrorState title="Usage error" description={error ?? "โหลดข้อมูลไม่ได้"} onRetry={load} />;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <Badge tone="purple">Usage limits</Badge>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">Usage Dashboard</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">ติดตาม quota รายวันของ Run Now, OpenAI, Telegram และจำนวน task ต่อ user</p>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <UsageLimitCard item={usage.runNowToday} />
        <UsageLimitCard item={usage.openAiToday} />
        <UsageLimitCard item={usage.telegramToday} />
        <UsageLimitCard item={usage.taskCount} />
      </section>

      <Card className="p-5">
        <h2 className="text-xl font-black text-white">Latest Usage Events</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="py-3">Type</th><th>Amount</th><th>User</th><th>Created</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-300">
              {usage.events.map((event) => (
                <tr key={event.id}>
                  <td className="py-3"><Badge tone="blue">{event.type}</Badge></td>
                  <td>{event.amount}</td>
                  <td>{event.userId ?? "-"}</td>
                  <td>{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
