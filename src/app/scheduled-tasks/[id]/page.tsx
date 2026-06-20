import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GptOutputCard } from "@/components/results/GptOutputCard";
import { TaskRunTimeline } from "@/components/results/TaskRunTimeline";
import { PriorityScoreBadge } from "@/components/tasks/PriorityScoreBadge";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScheduledTaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const task = db.scheduledTasks.find((item) => item.id === id);
  if (!task) notFound();

  const runs = db.taskRuns.filter((run) => run.taskId === id);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <Badge tone="blue">{task.scheduleType}</Badge>
              <Badge tone="gray">{task.type}</Badge>
            </div>
            <h1 className="mt-4 text-2xl font-black text-white">{task.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              Detail view for this scheduled task. Use the Scheduled Tasks page to run, pause, edit, or delete it.
            </p>
          </div>
          <PriorityScoreBadge score={task.minPriorityScore} label="Min" />
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300 md:grid-cols-3">
          <div>
            <p className="text-slate-500">Last Run</p>
            <p className="mt-1 font-semibold text-slate-200">{formatDateTime(task.lastRunAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Next Run</p>
            <p className="mt-1 font-semibold text-slate-200">{formatDateTime(task.nextRunAt)}</p>
          </div>
          <div>
            <p className="text-slate-500">Timezone</p>
            <p className="mt-1 font-semibold text-slate-200">{task.timezone}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Data Sources</p>
            <div className="flex flex-wrap gap-2">
              {task.dataSources.map((source) => (
                <Badge key={source} tone="gray">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">GPT Actions</p>
            <div className="flex flex-wrap gap-2">
              {task.gptActions.map((action) => (
                <Badge key={action} tone="purple">
                  {action}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Output Channels</p>
            <div className="flex flex-wrap gap-2">
              {task.outputChannels.map((channel) => (
                <Badge key={channel} tone="green">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
            href="/scheduled-tasks"
          >
            Back to Tasks
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            href={`/task-results?taskId=${task.id}`}
          >
            View Results
          </Link>
        </div>
      </Card>

      {runs[0] && <GptOutputCard run={runs[0]} />}
      <TaskRunTimeline runs={runs} />
    </div>
  );
}
