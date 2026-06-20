"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { WebNotification, NotificationCategory } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";

type ReadFilter = "All" | "Unread" | "Read";
type ImportanceFilter = "All" | "Important" | "Normal";

const categoryOptions: Array<"All" | NotificationCategory> = ["All", "Daily Brief", "Email", "Sale", "Football", "Long Read", "Concert", "Weekend", "Custom"];
const readOptions: ReadFilter[] = ["All", "Unread", "Read"];
const importanceOptions: ImportanceFilter[] = ["All", "Important", "Normal"];

function toCategory(type: string): NotificationCategory {
  if (type === "Daily Brief") return "Daily Brief";
  if (type === "Email Monitor") return "Email";
  if (type === "Sale Monitor") return "Sale";
  if (type === "World Cup Recap") return "Football";
  if (type === "Weekend Long Read") return "Long Read";
  if (type === "Concert Alerts") return "Concert";
  if (type === "Weekend Ideas") return "Weekend";
  return "Custom";
}

export function NotificationsApiView() {
  const [notifications, setNotifications] = useState<WebNotification[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [taskRuns, setTaskRuns] = useState<TaskRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | NotificationCategory>("All");
  const [selectedRead, setSelectedRead] = useState<ReadFilter>("All");
  const [selectedImportance, setSelectedImportance] = useState<ImportanceFilter>("All");
  const [importantIds, setImportantIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Phase 17: Notifications fetch ผ่าน API แล้ว");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [notificationData, taskData, runData] = await Promise.all([
        apiRequest<WebNotification[]>("/api/notifications"),
        apiRequest<ScheduledTask[]>("/api/scheduled-tasks"),
        apiRequest<TaskRun[]>("/api/task-runs"),
      ]);
      setNotifications(notificationData);
      setTasks(taskData);
      setTaskRuns(runData);
      setImportantIds(notificationData.filter((item) => item.priorityScore >= 80).map((item) => item.id));
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredNotifications = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      const task = tasks.find((item) => item.id === notification.taskId);
      const run = taskRuns.find((item) => item.id === notification.taskRunId);
      const category = toCategory(notification.type);
      const isImportant = importantIds.includes(notification.id);

      const matchesSearch =
        keyword.length === 0 ||
        [notification.title, notification.summary, notification.type, category, task?.name ?? "", run?.gptOutput.title ?? "", run?.gptOutput.summary ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      const matchesRead = selectedRead === "All" || (selectedRead === "Read" && notification.isRead) || (selectedRead === "Unread" && !notification.isRead);
      const matchesImportance = selectedImportance === "All" || (selectedImportance === "Important" && isImportant) || (selectedImportance === "Normal" && !isImportant);
      return matchesSearch && matchesCategory && matchesRead && matchesImportance;
    });
  }, [notifications, tasks, taskRuns, importantIds, search, selectedCategory, selectedRead, selectedImportance]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const importantCount = notifications.filter((item) => importantIds.includes(item.id)).length;
  const highPriorityCount = notifications.filter((item) => item.priorityScore >= 80).length;
  const averagePriority = Math.round(notifications.reduce((sum, item) => sum + item.priorityScore, 0) / Math.max(notifications.length, 1));

  async function handleToggleRead(notification: WebNotification) {
    try {
      const updated = await apiRequest<WebNotification>(`/api/notifications/${notification.id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ isRead: !notification.isRead }),
      });
      setNotifications((current) => current.map((item) => (item.id === notification.id ? updated : item)));
      setMessage(`${updated.isRead ? "Mark read" : "Mark unread"} สำเร็จผ่าน API: ${updated.title}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    }
  }

  function handleToggleImportant(notification: WebNotification) {
    setImportantIds((current) => {
      const exists = current.includes(notification.id);
      setMessage(`${exists ? "Remove important" : "Mark important"} แบบ local state: ${notification.title}`);
      return exists ? current.filter((id) => id !== notification.id) : [...current, notification.id];
    });
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((notification) => !notification.isRead);
    try {
      const updated = await Promise.all(
        unread.map((notification) =>
          apiRequest<WebNotification>(`/api/notifications/${notification.id}/read`, {
            method: "PATCH",
            body: JSON.stringify({ isRead: true }),
          }),
        ),
      );
      setNotifications((current) => current.map((item) => updated.find((next) => next.id === item.id) ?? item));
      setMessage("Mark all read สำเร็จผ่าน API");
    } catch (err) {
      setMessage(toErrorMessage(err));
    }
  }

  if (isLoading) return <LoadingState title="Loading notifications" description="กำลังดึง notifications จาก API" />;
  if (error) {
    return (
      <ErrorState
        title="Notifications loading failed"
        description={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 17 API Notifications</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Notifications</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Inbox นี้ดึงจาก /api/notifications และ mark read/unread ผ่าน PATCH /api/notifications/:id/read
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Notification Overview</p>
          <p className="mt-3 text-4xl font-black text-white">{notifications.length}</p>
          <p className="mt-1 text-sm text-slate-500">total from API</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Unread" value={unreadCount} tone="blue" />
            <Stat label="Important" value={importantCount} tone="red" />
            <Stat label="High Priority" value={highPriorityCount} tone="purple" />
            <Stat label="Avg Score" value={averagePriority} tone="green" />
          </div>
        </Card>
      </section>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:grid-cols-[1fr_180px_150px_170px_auto]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notification, task, GPT output..." />
        <select className="h-12 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value as "All" | NotificationCategory)}>
          {categoryOptions.map((category) => <option key={category} value={category}>{category === "All" ? "All categories" : category}</option>)}
        </select>
        <select className="h-12 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white" value={selectedRead} onChange={(event) => setSelectedRead(event.target.value as ReadFilter)}>
          {readOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select className="h-12 rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white" value={selectedImportance} onChange={(event) => setSelectedImportance(event.target.value as ImportanceFilter)}>
          {importanceOptions.map((option) => <option key={option} value={option}>{option === "All" ? "All importance" : option}</option>)}
        </select>
        <Button variant="secondary" onClick={loadData} type="button">Refresh</Button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">Showing {filteredNotifications.length}</Badge>
          <Button className="px-4 py-2 text-xs" variant="secondary" onClick={() => void handleMarkAllRead()} type="button">Mark All Read</Button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <EmptyState title="No notifications found" description="ลองล้าง filter หรือกด Run Now เพื่อสร้าง notification ใหม่" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredNotifications.map((notification) => {
            const task = tasks.find((item) => item.id === notification.taskId);
            const run = taskRuns.find((item) => item.id === notification.taskRunId);
            const isImportant = importantIds.includes(notification.id);
            return (
              <Card key={notification.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={notification.isRead ? "gray" : "blue"}>{notification.isRead ? "Read" : "Unread"}</Badge>
                      {isImportant && <Badge tone="red">Important</Badge>}
                      <Badge tone="purple">{toCategory(notification.type)}</Badge>
                    </div>
                    <h2 className="mt-4 text-lg font-black text-white">{notification.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{notification.summary}</p>
                    <p className="mt-3 text-xs text-slate-500">{task ? `Task: ${task.name}` : "Task not found"} • {formatDateTime(notification.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-cyan-100">{notification.priorityScore}</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">score</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
                  <Button variant="secondary" onClick={() => void handleToggleRead(notification)} type="button">
                    {notification.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button variant="secondary" onClick={() => handleToggleImportant(notification)} type="button">
                    {isImportant ? "Remove Important" : "Mark Important"}
                  </Button>
                  <Link className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-bold text-white" href={run ? `/task-results/${run.id}` : "/task-results"}>
                    Open Result
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "blue" | "red" | "purple" | "green" }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><Badge tone={tone}>{value}</Badge><p className="mt-2 text-xs text-slate-400">{label}</p></div>;
}
