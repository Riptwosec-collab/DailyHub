import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  tasks: ScheduledTask[];
  runs: TaskRun[];
  notifications: WebNotification[];
}

export function SummaryCards({ tasks, runs, notifications }: SummaryCardsProps) {
  const activeTasks = tasks.filter((task) => task.isActive).length;
  const runningTasks = tasks.filter((task) => task.status === "Running").length;
  const failedTasks = tasks.filter((task) => task.status === "Failed").length;
  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const latestPriority = Math.max(...runs.map((run) => run.priorityScore), 0);

  const cards = [
    {
      label: "Active Tasks",
      value: activeTasks,
      hint: `${runningTasks} task กำลัง running`,
      icon: "⏱",
      glow: "from-cyan-400/20 to-blue-500/10",
    },
    {
      label: "Latest Priority",
      value: `${latestPriority}/100`,
      hint: "คะแนนแจ้งเตือนล่าสุดจาก GPT",
      icon: "◎",
      glow: "from-violet-400/20 to-fuchsia-500/10",
    },
    {
      label: "Unread Alerts",
      value: unreadNotifications,
      hint: "notification ที่ยังไม่ได้อ่าน",
      icon: "●",
      glow: "from-sky-400/20 to-cyan-500/10",
    },
    {
      label: "Failed Tasks",
      value: failedTasks,
      hint: failedTasks > 0 ? "มีงานที่ต้องตรวจสอบ" : "ระบบ mock ทำงานปกติ",
      icon: "!",
      glow: "from-rose-400/20 to-orange-500/10",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="group relative overflow-hidden p-5">
          <div className={cn("absolute inset-x-0 top-0 h-28 bg-gradient-to-br opacity-80 blur-2xl", card.glow)} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {card.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{card.hint}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-lg font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition group-hover:scale-105">
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}
