import { AppShell } from "@/components/layout/AppShell";
import { ScheduledTasksApiView } from "@/components/tasks/ScheduledTasksApiView";

export default function ScheduledTasksPage() {
  return (
    <AppShell>
      <ScheduledTasksApiView />
    </AppShell>
  );
}
