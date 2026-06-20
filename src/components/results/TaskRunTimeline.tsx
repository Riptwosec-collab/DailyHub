import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun, TaskRunStatus } from "@/types/task-run";

const statusTone: Record<TaskRunStatus, "green" | "red" | "purple"> = {
  success: "green",
  failed: "red",
  running: "purple",
};

interface TaskRunTimelineProps {
  runs: TaskRun[];
  tasks?: ScheduledTask[];
}

export function TaskRunTimeline({ runs, tasks = [] }: TaskRunTimelineProps) {
  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-cyan-200">Timeline</p>
          <h2 className="mt-1 text-2xl font-black text-white">Task Run Timeline</h2>
        </div>
        <Badge tone="blue">{runs.length} runs</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {runs.map((run, index) => {
          const task = tasks.find((item) => item.id === run.taskId);

          return (
            <div key={run.id} className="grid gap-4 sm:grid-cols-[2rem_1fr]">
              <div className="hidden sm:flex sm:flex-col sm:items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 text-xs font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                  {index + 1}
                </div>
                {index !== runs.length - 1 && <div className="mt-3 h-full w-px bg-gradient-to-b from-cyan-300/30 to-violet-500/10" />}
              </div>

              <Link
                href={`/task-results/${run.id}`}
                className="block rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone[run.status]}>{run.status}</Badge>
                      <Badge tone="gray">{task?.type ?? run.taskId}</Badge>
                      <Badge tone={run.priorityScore >= 80 ? "red" : run.priorityScore >= 60 ? "purple" : "gray"}>
                        {run.priorityScore}/100
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-base font-black text-white">{run.gptOutput.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{run.gptOutput.summary}</p>
                  </div>

                  <div className="shrink-0 text-xs text-slate-500 md:text-right">
                    <p>{formatDateTime(run.startedAt)}</p>
                    <p className="mt-1">Telegram: {run.telegramStatus}</p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
