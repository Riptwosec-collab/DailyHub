"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";

interface NotificationCardProps {
  notification: WebNotification;
  task?: ScheduledTask | null;
  taskRun?: TaskRun | null;
  isImportant: boolean;
  onToggleRead: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

export function NotificationCard({
  notification,
  task,
  taskRun,
  isImportant,
  onToggleRead,
  onToggleImportant,
}: NotificationCardProps) {
  const scoreTone = notification.priorityScore >= 85 ? "red" : notification.priorityScore >= 70 ? "purple" : "blue";

  return (
    <Card className="group relative overflow-hidden p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.08]">
      <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />
      <div className="absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl transition group-hover:bg-violet-500/20" />

      <div className="relative space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={notification.isRead ? "gray" : "blue"}>
                {notification.isRead ? "Read" : "Unread"}
              </Badge>
              {isImportant && <Badge tone="red">Important</Badge>}
              <Badge tone="purple">{notification.type}</Badge>
              <Badge tone={scoreTone}>Priority {notification.priorityScore}/100</Badge>
            </div>

            <h2 className="mt-4 text-xl font-black tracking-tight text-white">
              {notification.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-300">
              {notification.summary}
            </p>
          </div>

          <div className="shrink-0 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center">
            <p className="text-3xl font-black text-cyan-100">{notification.priorityScore}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">score</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-xs text-slate-400 md:grid-cols-3">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-slate-500">Task</p>
            <p className="mt-2 truncate text-slate-200">{task?.name ?? notification.taskId}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-slate-500">Run Status</p>
            <p className="mt-2 text-slate-200">{taskRun?.status ?? "unknown"}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-slate-500">Created</p>
            <p className="mt-2 text-slate-200">{formatDateTime(notification.createdAt)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full px-4 py-2 text-xs sm:w-auto"
              variant="secondary"
              onClick={() => onToggleRead(notification.id)}
              type="button"
            >
              {notification.isRead ? "Mark Unread" : "Mark Read"}
            </Button>
            <Button
              className="w-full px-4 py-2 text-xs sm:w-auto"
              variant="secondary"
              onClick={() => onToggleImportant(notification.id)}
              type="button"
            >
              {isImportant ? "Remove Important" : "Mark Important"}
            </Button>
          </div>

          <Link
            href={`/task-results/${notification.taskRunId}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 sm:w-auto"
          >
            Open Result
          </Link>
        </div>
      </div>
    </Card>
  );
}
