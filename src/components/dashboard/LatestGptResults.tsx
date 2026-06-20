import Link from "next/link";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { clampScore, formatDateTime } from "@/lib/utils";

export function LatestGptResults({ runs }: { runs: TaskRun[] }) {
  const latest = runs.slice(0, 3);

  if (latest.length === 0) {
    return (
      <EmptyState
        title="No GPT results yet"
        description="ลองสร้าง Scheduled Task แล้วกด Run Now เพื่อดูผลลัพธ์จาก GPT"
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Latest GPT Results</p>
          <h2 className="mt-1 text-2xl font-black text-white">ผลลัพธ์ล่าสุดจาก Scheduled Tasks</h2>
        </div>
        <Link href="/task-results" className="hidden text-sm font-bold text-cyan-200 hover:text-cyan-100 sm:block">
          View all →
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {latest.map((run) => (
          <Card key={run.id} className="flex min-h-[260px] flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "purple"}>
                  {run.status}
                </Badge>
                <span className="text-xs text-slate-500">{formatDateTime(run.startedAt)}</span>
              </div>

              <h3 className="mt-4 text-lg font-black text-white">{run.gptOutput.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{run.gptOutput.summary}</p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Priority Score</span>
                  <span className="font-black text-cyan-100">{run.priorityScore}/100</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500"
                    style={{ width: `${clampScore(run.priorityScore)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">Telegram: {run.telegramStatus}</Badge>
                {run.gptOutput.caption && <Badge tone="purple">Caption Ready</Badge>}
                {run.gptOutput.image_prompt && <Badge tone="gray">Image Prompt</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
