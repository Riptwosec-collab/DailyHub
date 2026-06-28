import Link from "next/link";
import type { WebNotification } from "@/types/notification";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

export function LatestNotifications({ notifications }: { notifications: WebNotification[] }) {
  const latest = notifications.slice(0, 4);

  if (latest.length === 0) {
    return <EmptyState title="No notifications" description="เมื่อ Task Run สำเร็จ ระบบจะสร้าง notification มาแสดงตรงนี้" />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-200">Notifications</p>
          <h2 className="mt-1 text-2xl font-black text-white">แจ้งเตือนล่าสุด</h2>
        </div>
        <Link href="/notifications" className="hidden text-sm font-bold text-cyan-200 hover:text-cyan-100 sm:block">
          Open inbox →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {latest.map((notification) => (
          <Card key={notification.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={notification.isRead ? "gray" : "blue"}>
                    {notification.isRead ? "Read" : "Unread"}
                  </Badge>
                  {notification.priorityScore >= 80 && <Badge tone="red">Important</Badge>}
                  <Badge tone="purple">{notification.type}</Badge>
                </div>
                <h3 className="mt-4 text-base font-black text-white">{notification.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{notification.summary}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-black text-cyan-100">{notification.priorityScore}</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">score</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-xs text-slate-500">{formatDateTime(notification.createdAt)}</span>
              <span className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white">
                Inbox Detail
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
