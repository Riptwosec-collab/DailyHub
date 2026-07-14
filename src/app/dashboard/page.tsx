import { DashboardOverviewView } from "@/components/dashboard/DashboardOverviewView";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardOverviewView />
    </AppShell>
  );
}
