import { AdminDashboardView } from "@/components/admin/AdminDashboardView";
import { AppShell } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminUser();

  return (
    <AppShell>
      <AdminDashboardView />
    </AppShell>
  );
}
