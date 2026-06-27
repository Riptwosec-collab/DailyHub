import { AdminLogsView } from "@/components/admin/AdminLogsView";
import { AppShell } from "@/components/layout/AppShell";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  await requireAdminUser();

  return (
    <AppShell>
      <AdminLogsView />
    </AppShell>
  );
}
