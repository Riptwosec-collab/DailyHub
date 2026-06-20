import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import { PriorityScoreBadge } from "./PriorityScoreBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface TaskTableProps {
  tasks: ScheduledTask[];
  busyTaskIds: string[];
  onRunNow: (taskId: string) => void;
  onTogglePause: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTable({ tasks, busyTaskIds, onRunNow, onTogglePause, onDelete }: TaskTableProps) {
  return (
    <Card className="hidden overflow-hidden lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-bold">Task</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Schedule</th>
              <th className="px-5 py-4 font-bold">Last Run</th>
              <th className="px-5 py-4 font-bold">Next Run</th>
              <th className="px-5 py-4 font-bold">Sources</th>
              <th className="px-5 py-4 font-bold">Priority</th>
              <th className="px-5 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {tasks.map((task) => {
              const isBusy = busyTaskIds.includes(task.id);
              const isPaused = task.status === "Paused";

              return (
                <tr key={task.id} className="transition hover:bg-white/[0.035]">
                  <td className="px-5 py-5 align-top">
                    <p className="font-black text-white">{task.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{task.type}</p>
                    <p className="mt-2 text-xs text-slate-500">{task.timezone}</p>
                  </td>
                  <td className="px-5 py-5 align-top">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-5 py-5 align-top">
                    <Badge tone="blue">{task.scheduleType}</Badge>
                    <p className="mt-2 text-xs text-slate-500">{task.time ?? task.cronExpression ?? "Auto"}</p>
                  </td>
                  <td className="px-5 py-5 align-top text-slate-300">{formatDateTime(task.lastRunAt)}</td>
                  <td className="px-5 py-5 align-top text-slate-300">{formatDateTime(task.nextRunAt)}</td>
                  <td className="px-5 py-5 align-top">
                    <div className="flex max-w-[220px] flex-wrap gap-2">
                      {task.dataSources.slice(0, 2).map((source) => (
                        <Badge key={source} tone="gray">
                          {source}
                        </Badge>
                      ))}
                      {task.dataSources.length > 2 && <Badge tone="gray">+{task.dataSources.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-5 align-top">
                    <PriorityScoreBadge score={task.minPriorityScore} label="Min" />
                  </td>
                  <td className="px-5 py-5 align-top">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="px-3 py-2 text-xs"
                        disabled={isBusy || isPaused}
                        onClick={() => onRunNow(task.id)}
                        type="button"
                      >
                        {isBusy ? "Running" : "Run Now"}
                      </Button>
                      <Link
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white transition hover:bg-white/[0.1]"
                        href={`/task-results?taskId=${task.id}`}
                      >
                        Results
                      </Link>
                      <Link
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white transition hover:bg-white/[0.1]"
                        href={`/scheduled-tasks/create?edit=${task.id}`}
                      >
                        Edit
                      </Link>
                      <Button
                        className="px-3 py-2 text-xs"
                        variant="secondary"
                        onClick={() => onTogglePause(task.id)}
                        type="button"
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button className="px-3 py-2 text-xs" variant="ghost" onClick={() => onDelete(task.id)} type="button">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
