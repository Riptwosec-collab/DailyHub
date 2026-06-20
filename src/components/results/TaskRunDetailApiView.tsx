"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { clampScore, formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";

export function TaskRunDetailApiView({ runId }: { runId: string }) {
  const [run, setRun] = useState<TaskRun | null>(null);
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Loaded from API");

  const loadRun = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const runData = await apiRequest<TaskRun>(`/api/task-runs/${runId}`);
      setRun(runData);
      try {
        const taskData = await apiRequest<ScheduledTask>(`/api/scheduled-tasks/${runData.taskId}`);
        setTask(taskData);
      } catch {
        setTask(null);
      }
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void loadRun();
  }, [loadRun]);

  async function handleCopy() {
    if (!run) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(run, null, 2));
      setMessage("Copy full task run สำเร็จ");
    } catch {
      setMessage("Copy ไม่สำเร็จ");
    }
  }

  async function handleRegenerate() {
    if (!run) return;
    setMessage("กำลัง regenerate ผ่าน API...");
    try {
      const updatedRun = await apiRequest<TaskRun>(`/api/task-runs/${run.id}/regenerate`, { method: "POST" });
      setRun(updatedRun);
      setMessage("Regenerate สำเร็จผ่าน API");
    } catch (err) {
      setMessage(toErrorMessage(err));
    }
  }

  if (isLoading) return <LoadingState title="Loading task run detail" description="กำลังดึงรายละเอียด task run จาก API" />;
  if (error) {
    return (
      <ErrorState
        title="Task run detail loading failed"
        description={error}
        onRetry={loadRun}
      />
    );
  }
  if (!run) {
    return (
      <ErrorState
        title="ไม่พบ Task Run"
        description={`Task run ${runId} was not found`}
        onRetry={loadRun}
      />
    );
  }

  const score = clampScore(run.priorityScore);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "purple"}>{run.status}</Badge>
            <Badge tone="blue">Priority {run.priorityScore}/100</Badge>
            <Badge tone="gray">Telegram: {run.telegramStatus}</Badge>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">{run.gptOutput.title}</h1>
          <p className="mt-3 text-sm text-slate-400">Run ID: {run.id} {task ? `• Task: ${task.name}` : ""}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => void handleRegenerate()} type="button">Regenerate</Button>
            <Button variant="secondary" onClick={() => void handleCopy()} type="button">Copy Full Run</Button>
            <Link className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white" href="/task-results">Back</Link>
          </div>
          <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300">{message}</p>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Summary</p>
        <p className="mt-4 text-sm leading-7 text-slate-300">{run.gptOutput.summary}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500" style={{ width: `${score}%` }} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <JsonPanel title="Raw Input" value={run.rawInput} />
        <JsonPanel title="GPT Output" value={run.gptOutput} />
      </div>

      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">GPT Prompt</p>
        <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">{run.gptPrompt}</pre>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Timeline</p>
        <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <p>Started: {formatDateTime(run.startedAt)}</p>
          <p>Finished: {formatDateTime(run.finishedAt)}</p>
          <p>Error: {run.errorMessage ?? "-"}</p>
          <p>Task ID: {run.taskId}</p>
        </div>
      </Card>
    </div>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{title}</p>
      <pre className="mt-4 max-h-[32rem] overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </Card>
  );
}
