"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun, TaskRunStatus } from "@/types/task-run";

const statusTone: Record<TaskRunStatus, "green" | "red" | "purple"> = {
  success: "green",
  failed: "red",
  running: "purple",
};

interface GptOutputCardProps {
  run: TaskRun;
  task?: ScheduledTask | null;
  detailed?: boolean;
  onRegenerate?: (runId: string) => void;
  onCopy?: (run: TaskRun) => void;
  onSaveAsContent?: (run: TaskRun) => void;
}

export function GptOutputCard({
  run,
  task,
  detailed = false,
  onRegenerate,
  onCopy,
  onSaveAsContent,
}: GptOutputCardProps) {
  const [expanded, setExpanded] = useState(detailed);
  const safeScore = Math.min(Math.max(run.priorityScore, 0), 100);

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-24 left-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone[run.status]}>{run.status}</Badge>
              <Badge tone="blue">Priority {run.priorityScore}/100</Badge>
              <Badge tone={run.telegramStatus === "mock_sent" || run.telegramStatus === "sent" ? "green" : "gray"}>
                Telegram: {run.telegramStatus}
              </Badge>
            </div>

            <h2 className="mt-4 text-xl font-black text-white">{run.gptOutput.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Run ID: {run.id} {task ? `• Task: ${task.name}` : ""}
            </p>
          </div>

          <Link
            href={`/task-results/${run.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Open Result
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Priority Score</span>
            <span className="font-black text-cyan-100">{safeScore}/100</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500" style={{ width: `${safeScore}%` }} />
          </div>
        </div>

        <div>
          <p className={expanded ? "text-sm leading-7 text-slate-300" : "line-clamp-3 text-sm leading-7 text-slate-300"}>
            {run.gptOutput.summary}
          </p>
          {!detailed && (
            <button
              className="mt-2 text-xs font-bold text-cyan-200 hover:text-cyan-100"
              onClick={() => setExpanded((current) => !current)}
              type="button"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">Recommended Action</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">{run.gptOutput.recommended_action}</p>
        </div>

        {(run.gptOutput.caption || run.gptOutput.image_prompt) && (
          <div className="grid gap-3 lg:grid-cols-2">
            {run.gptOutput.caption && (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Caption</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">{run.gptOutput.caption}</p>
              </div>
            )}
            {run.gptOutput.image_prompt && (
              <div className="rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-200">Image Prompt</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">{run.gptOutput.image_prompt}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 border-t border-white/10 pt-4 text-xs text-slate-500 sm:grid-cols-2">
          <p>Started: {formatDateTime(run.startedAt)}</p>
          <p>Finished: {formatDateTime(run.finishedAt)}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" variant="secondary" onClick={() => onRegenerate?.(run.id)} type="button">
            Regenerate
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary" onClick={() => onCopy?.(run)} type="button">
            Copy
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => onSaveAsContent?.(run)} type="button">
            Save as Content
          </Button>
        </div>
      </div>
    </Card>
  );
}
