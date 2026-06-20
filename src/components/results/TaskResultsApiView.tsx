"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { clampScore, formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun, TaskRunStatus } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";

const statuses: Array<"All" | TaskRunStatus> = ["All", "success", "running", "failed"];

export function TaskResultsApiView() {
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | TaskRunStatus>("All");
  const [busyRunIds, setBusyRunIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Phase 17: Task Results fetch ผ่าน API แล้ว");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [runData, taskData] = await Promise.all([
        apiRequest<TaskRun[]>("/api/task-runs"),
        apiRequest<ScheduledTask[]>("/api/scheduled-tasks"),
      ]);
      setRuns(runData);
      setTasks(taskData);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRuns = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return runs.filter((run) => {
      const task = tasks.find((item) => item.id === run.taskId);
      const matchesStatus = selectedStatus === "All" || run.status === selectedStatus;
      const matchesSearch =
        keyword.length === 0 ||
        [run.id, run.status, run.telegramStatus, run.errorMessage ?? "", run.gptPrompt, run.gptOutput.title, run.gptOutput.summary, task?.name ?? "", task?.type ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [runs, tasks, search, selectedStatus]);

  const successCount = runs.filter((run) => run.status === "success").length;
  const runningCount = runs.filter((run) => run.status === "running").length;
  const failedCount = runs.filter((run) => run.status === "failed").length;
  const averagePriority = Math.round(runs.reduce((sum, run) => sum + run.priorityScore, 0) / Math.max(runs.length, 1));

  async function handleCopy(run: TaskRun) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(run.gptOutput, null, 2));
      setMessage(`Copy GPT output สำเร็จ: ${run.gptOutput.title}`);
    } catch {
      setMessage("Copy ไม่สำเร็จ เบราว์เซอร์อาจไม่อนุญาต clipboard");
    }
  }

  async function handleRegenerate(run: TaskRun) {
    setBusyRunIds((current) => [...current, run.id]);
    setMessage(`กำลัง regenerate ผ่าน API: ${run.id}`);

    try {
      const updatedRun = await apiRequest<TaskRun>(`/api/task-runs/${run.id}/regenerate`, { method: "POST" });
      setRuns((current) => current.map((item) => (item.id === run.id ? updatedRun : item)));
      setMessage(`Regenerate สำเร็จผ่าน API: ${updatedRun.gptOutput.title}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setBusyRunIds((current) => current.filter((id) => id !== run.id));
    }
  }

  if (isLoading) return <LoadingState title="Loading task results" description="กำลังดึง task runs จาก /api/task-runs" />;
  if (error) {
    return (
      <ErrorState
        title="Task results loading failed"
        description={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 17 API Results</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Task Results</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              ประวัติการรันทั้งหมดถูกดึงจาก /api/task-runs และ regenerate ผ่าน /api/task-runs/:id/regenerate
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Run Overview</p>
          <p className="mt-3 text-4xl font-black text-white">{runs.length}</p>
          <p className="mt-1 text-sm text-slate-500">total runs from API</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Success" value={successCount} tone="green" />
            <Stat label="Running" value={runningCount} tone="purple" />
            <Stat label="Failed" value={failedCount} tone="red" />
            <Stat label="Avg Score" value={averagePriority} tone="blue" />
          </div>
        </Card>
      </section>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-[1fr_190px_auto]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search run title, prompt, output, error..." />
        <select className="h-12 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as "All" | TaskRunStatus)}>
          {statuses.map((status) => <option key={status} value={status}>{status === "All" ? "All status" : status}</option>)}
        </select>
        <Button variant="secondary" onClick={loadData} type="button">Refresh</Button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <Badge tone="blue">Showing {filteredRuns.length}</Badge>
      </div>

      {filteredRuns.length === 0 ? (
        <EmptyState title="No task runs found" description="ลองกด Run Now จากหน้า Scheduled Tasks เพื่อสร้าง task run ใหม่" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredRuns.map((run) => {
            const task = tasks.find((item) => item.id === run.taskId);
            const isBusy = busyRunIds.includes(run.id);
            return (
              <Card key={run.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "purple"}>{run.status}</Badge>
                      <Badge tone={clampScore(run.priorityScore) >= 80 ? "red" : clampScore(run.priorityScore) >= 60 ? "blue" : "slate"}>Score {clampScore(run.priorityScore)}</Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-black text-white">{run.gptOutput.title}</h2>
                    <p className="mt-2 text-sm text-slate-400">{task?.name ?? run.taskId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="secondary"><Link href={`/task-results/${run.id}`}>Open</Link></Button>
                    <Button size="sm" variant="secondary" onClick={() => void handleCopy(run)}>Copy</Button>
                    <Button size="sm" onClick={() => void handleRegenerate(run)} disabled={isBusy}>{isBusy ? "Running" : "Regenerate"}</Button>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{run.gptOutput.summary}</p>
                <div className="mt-5 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                  <Info label="Started" value={formatDateTime(run.startedAt)} />
                  <Info label="Finished" value={run.finishedAt ? formatDateTime(run.finishedAt) : "-"} />
                  <Info label="Telegram" value={run.telegramStatus ?? "-"} />
                </div>
                {run.errorMessage ? <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{run.errorMessage}</p> : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "green" | "purple" | "red" | "blue" }) {
  const toneClass = {
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    purple: "border-violet-300/20 bg-violet-300/10 text-violet-200",
    red: "border-red-300/20 bg-red-300/10 text-red-200",
    blue: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  }[tone];
  return <div className={`rounded-2xl border p-3 ${toneClass}`}><p className="font-bold">{value}</p><p className="text-xs opacity-80">{label}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><p className="font-semibold text-slate-400">{label}</p><p className="mt-1 text-slate-200">{value}</p></div>;
}
