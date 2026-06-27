import { AdminErrorsView } from "@/components/admin/AdminErrorsView";
import { AppShell } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminErrorsPage() {
  await requireAdminUser();

  return (
    <AppShell>
      <AdminErrorsView />
    </AppShell>
  );
}
