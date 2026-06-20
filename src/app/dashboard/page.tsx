import { DashboardApiView } from "@/components/dashboard/DashboardApiView";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardApiView />
    </AppShell>
  );
}
