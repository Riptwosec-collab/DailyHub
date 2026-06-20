"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun, TaskRunStatus } from "@/types/task-run";
import { ErrorLogCard } from "./ErrorLogCard";
import { GptOutputCard } from "./GptOutputCard";
import { TaskRunTimeline } from "./TaskRunTimeline";

interface TaskResultsViewProps {
  runs: TaskRun[];
  tasks: ScheduledTask[];
}

const statuses: Array<"All" | TaskRunStatus> = ["All", "success", "running", "failed"];

export function TaskResultsView({ runs, tasks }: TaskResultsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | TaskRunStatus>("All");
  const [message, setMessage] = useState("Phase 5 ใช้ mock data ก่อน กด Regenerate / Copy / Save as Content เพื่อทดสอบ UI ได้เลย");

  const filteredRuns = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return runs.filter((run) => {
      const task = tasks.find((item) => item.id === run.taskId);
      const matchesStatus = selectedStatus === "All" || run.status === selectedStatus;
      const matchesSearch =
        keyword.length === 0 ||
        [
          run.id,
          run.taskId,
          run.status,
          run.telegramStatus,
          run.errorMessage ?? "",
          run.gptPrompt,
          run.gptOutput.title,
          run.gptOutput.summary,
          run.gptOutput.recommended_action,
          run.gptOutput.caption ?? "",
          run.gptOutput.image_prompt ?? "",
          task?.name ?? "",
          task?.type ?? "",
        ]
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
    const text = JSON.stringify(
      {
        title: run.gptOutput.title,
        summary: run.gptOutput.summary,
        priority_score: run.priorityScore,
        recommended_action: run.gptOutput.recommended_action,
        caption: run.gptOutput.caption,
        image_prompt: run.gptOutput.image_prompt,
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(text);
      setMessage(`Copy GPT output สำเร็จ: ${run.gptOutput.title}`);
    } catch {
      setMessage("Copy ไม่สำเร็จ เบราว์เซอร์อาจไม่อนุญาต clipboard ในโหมดนี้");
    }
  }

  function handleRegenerate(runId: string) {
    setMessage(`Regenerate แบบ mock สำหรับ ${runId} แล้ว — Phase 7/8 จะเชื่อม API จริง`);
  }

  function handleSaveAsContent(run: TaskRun) {
    setMessage(`Save as Content แบบ mock แล้ว: ${run.gptOutput.title}`);
  }

  function resetFilters() {
    setSearch("");
    setSelectedStatus("All");
    setMessage("ล้าง filter แล้ว");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 5 Task Results</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Task Results</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              ดูประวัติการรัน Scheduled Tasks ทั้งหมด พร้อม GPT output, raw input, prompt, priority score, telegram status, error log และ action สำหรับ Regenerate / Copy / Save as Content
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Run Overview</p>
          <p className="mt-3 text-4xl font-black text-white">{runs.length}</p>
          <p className="mt-1 text-sm text-slate-500">total task runs</p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-black text-emerald-100">{successCount}</p>
              <p className="text-xs text-emerald-100/70">Success</p>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-300/10 p-3">
              <p className="font-black text-violet-100">{runningCount}</p>
              <p className="text-xs text-violet-100/70">Running</p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
              <p className="font-black text-rose-100">{failedCount}</p>
              <p className="text-xs text-rose-100/70">Failed</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
              <p className="font-black text-cyan-100">{averagePriority}</p>
              <p className="text-xs text-cyan-100/70">Avg Score</p>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:grid-cols-[1fr_190px_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search run title, prompt, output, telegram, error..."
        />

        <select
          className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value as "All" | TaskRunStatus)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "All status" : status}
            </option>
          ))}
        </select>

        <Button variant="secondary" onClick={resetFilters} type="button">
          Reset Filter
        </Button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <Badge tone="blue">Showing {filteredRuns.length}</Badge>
      </div>

      {filteredRuns.length === 0 ? (
        <EmptyState title="No task runs found" description="ลองล้าง filter หรือค้นหาด้วยชื่อ result / prompt / error อื่น" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredRuns.map((run) => {
            const task = tasks.find((item) => item.id === run.taskId) ?? null;

            return (
              <div key={run.id} className="space-y-4">
                <GptOutputCard
                  run={run}
                  task={task}
                  onRegenerate={handleRegenerate}
                  onCopy={handleCopy}
                  onSaveAsContent={handleSaveAsContent}
                />
                {run.status === "failed" && <ErrorLogCard error={run.errorMessage} compact />}
              </div>
            );
          })}
        </div>
      )}

      <TaskRunTimeline runs={filteredRuns} tasks={tasks} />
    </div>
  );
}
