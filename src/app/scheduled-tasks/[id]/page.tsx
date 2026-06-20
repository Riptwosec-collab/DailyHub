import { notFound } from "next/navigation";
import { GptOutputCard } from "@/components/results/GptOutputCard";
import { TaskRunTimeline } from "@/components/results/TaskRunTimeline";
import { TaskCard } from "@/components/tasks/TaskCard";
import { db } from "@/lib/db";

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
      <TaskCard task={task} />
      {runs[0] && <GptOutputCard run={runs[0]} />}
      <TaskRunTimeline runs={runs} />
    </div>
  );
}
