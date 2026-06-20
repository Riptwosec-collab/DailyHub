import { Card } from "@/components/ui/Card";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import type { WebNotification } from "@/types/notification";

export function ScheduledSummary({ tasks, runs, notifications }: { tasks: ScheduledTask[]; runs: TaskRun[]; notifications: WebNotification[] }) {
  const active = tasks.filter((task) => task.status === "Active" || task.status === "Running").length;
  const failed = tasks.filter((task) => task.status === "Failed").length;
  const unread = notifications.filter((item) => !item.isRead).length;
  const successRuns = runs.filter((run) => run.status === "success").length;

  const cards = [
    { label: "Active Tasks", value: active, hint: "พร้อมรันตาม schedule" },
    { label: "Successful Runs", value: successRuns, hint: "ประวัติที่สำเร็จ" },
    { label: "Unread Alerts", value: unread, hint: "notification ใหม่" },
    { label: "Failed Tasks", value: failed, hint: "ต้องตรวจสอบ" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-3 text-4xl font-black text-white">{card.value}</p>
          <p className="mt-2 text-xs text-slate-500">{card.hint}</p>
        </Card>
      ))}
    </div>
  );
}
