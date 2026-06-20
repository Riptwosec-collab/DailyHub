import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AppShell } from "@/components/layout/AppShell";

export default function AdminPage() {
  return (
    <AppShell>
      <AdminDashboardView />
    </AppShell>
  );
}
