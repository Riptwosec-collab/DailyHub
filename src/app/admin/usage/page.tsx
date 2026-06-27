import { AdminUsageView } from "@/components/admin/AdminUsageView";
import { AppShell } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  await requireAdminUser();

  return (
    <AppShell>
      <AdminUsageView />
    </AppShell>
  );
}
