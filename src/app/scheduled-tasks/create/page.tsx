import { AppShell } from "@/components/layout/AppShell";
import { TaskFormApi } from "@/components/tasks/TaskFormApi";

export default function CreateScheduledTaskPage() {
  return (
    <AppShell>
      <TaskFormApi />
    </AppShell>
  );
}
