"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { ErrorLogCard } from "./ErrorLogCard";
import { GptOutputCard } from "./GptOutputCard";

interface TaskRunDetailViewProps {
  run: TaskRun;
  task: ScheduledTask | null;
}

export function TaskRunDetailView({ run, task }: TaskRunDetailViewProps) {
  const [message, setMessage] = useState("ดูรายละเอียด Task Run แบบ mock ก่อนต่อ API จริงใน Phase 7");

  async function handleCopy() {
    const text = JSON.stringify(
      {
        raw_input: run.rawInput,
        gpt_prompt: run.gptPrompt,
        gpt_output: run.gptOutput,
        priority_score: run.priorityScore,
        telegram_status: run.telegramStatus,
        error_message: run.errorMessage,
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(text);
      setMessage(`Copy full task run สำเร็จ: ${run.id}`);
    } catch {
      setMessage("Copy ไม่สำเร็จ เบราว์เซอร์อาจไม่อนุญาต clipboard ในโหมดนี้");
    }
  }

  function handleRegenerate() {
    setMessage(`Regenerate แบบ mock สำหรับ ${run.id} แล้ว — Phase 7/8 จะทำ endpoint จริง`);
  }

  function handleSaveAsContent() {
    setMessage(`Save as Content แบบ mock แล้ว: ${run.gptOutput.title}`);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "purple"}>{run.status}</Badge>
              <Badge tone="blue">{run.priorityScore}/100</Badge>
              <Badge tone="gray">Run ID: {run.id}</Badge>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">{run.gptOutput.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              รายละเอียด task run พร้อม raw input, GPT prompt, GPT output, priority score, telegram status และ error log
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Task Info</p>
          <h2 className="mt-3 text-xl font-black text-white">{task?.name ?? run.taskId}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>Type: {task?.type ?? "-"}</p>
            <p>Schedule: {task?.scheduleType ?? "-"}</p>
            <p>Started: {formatDateTime(run.startedAt)}</p>
            <p>Finished: {formatDateTime(run.finishedAt)}</p>
            <p>Telegram: {run.telegramStatus}</p>
          </div>
        </Card>
      </section>

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <Link href="/task-results" className="text-sm font-bold text-cyan-100 hover:text-white">
          ← Back to results
        </Link>
      </div>

      <GptOutputCard
        run={run}
        task={task}
        detailed
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onSaveAsContent={handleSaveAsContent}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">Raw Input</p>
              <p className="mt-1 text-xs text-slate-500">ข้อมูลต้นทางก่อนส่งเข้า GPT</p>
            </div>
            <Badge tone="blue">JSON</Badge>
          </div>
          <pre className="mt-4 max-h-[28rem] overflow-auto rounded-2xl border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify(run.rawInput, null, 2)}
          </pre>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">GPT Prompt</p>
              <p className="mt-1 text-xs text-slate-500">prompt ที่ backend สร้างตาม GPT Actions</p>
            </div>
            <Badge tone="purple">Prompt</Badge>
          </div>
          <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300">
            {run.gptPrompt}
          </pre>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">Full GPT Output</p>
            <p className="mt-1 text-xs text-slate-500">JSON output ที่ควรใช้ต่อกับ Dashboard, Notifications และ Content</p>
          </div>
          <Button variant="secondary" onClick={handleCopy} type="button">
            Copy Full Run
          </Button>
        </div>
        <pre className="mt-4 max-h-[32rem] overflow-auto rounded-2xl border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300">
          {JSON.stringify(run.gptOutput, null, 2)}
        </pre>
      </Card>

      <ErrorLogCard error={run.errorMessage} />
    </div>
  );
}
