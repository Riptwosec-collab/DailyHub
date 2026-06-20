import { AppShell } from "@/components/layout/AppShell";
import { NotificationsApiView } from "@/components/notifications/NotificationsApiView";

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsApiView />
    </AppShell>
  );
}
