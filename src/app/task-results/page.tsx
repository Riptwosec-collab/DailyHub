import { AppShell } from "@/components/layout/AppShell";
import { TaskResultsApiView } from "@/components/results/TaskResultsApiView";

export default function TaskResultsPage() {
  return (
    <AppShell>
      <TaskResultsApiView />
    </AppShell>
  );
}
