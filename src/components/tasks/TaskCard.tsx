import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import { PriorityScoreBadge } from "./PriorityScoreBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface TaskCardProps {
  task: ScheduledTask;
  isBusy?: boolean;
  onRunNow: (taskId: string) => void;
  onTogglePause: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, isBusy = false, onRunNow, onTogglePause, onDelete }: TaskCardProps) {
  const isPaused = task.status === "Paused";

  return (
    <Card className="p-5 lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <Badge tone="blue">{task.scheduleType}</Badge>
          </div>
          <h2 className="mt-4 text-lg font-black text-white">{task.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{task.type}</p>
        </div>
        <PriorityScoreBadge score={task.minPriorityScore} label="Min" />
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Last Run</span>
          <span className="text-right font-semibold text-slate-200">{formatDateTime(task.lastRunAt)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Next Run</span>
          <span className="text-right font-semibold text-slate-200">{formatDateTime(task.nextRunAt)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Timezone</span>
          <span className="text-right font-semibold text-slate-200">{task.timezone}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.dataSources.slice(0, 3).map((source) => (
          <Badge key={source} tone="gray">
            {source}
          </Badge>
        ))}
        {task.dataSources.length > 3 && <Badge tone="gray">+{task.dataSources.length - 3}</Badge>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button disabled={isBusy || isPaused} onClick={() => onRunNow(task.id)} type="button">
          {isBusy ? "Running..." : "Run Now"}
        </Button>
        <Link
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          href={`/task-results?taskId=${task.id}`}
        >
          View Results
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          href={`/scheduled-tasks/create?edit=${task.id}`}
        >
          Edit
        </Link>
        <Button variant="secondary" onClick={() => onTogglePause(task.id)} type="button">
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Button className="col-span-2" variant="ghost" onClick={() => onDelete(task.id)} type="button">
          Delete
        </Button>
      </div>
    </Card>
  );
}
