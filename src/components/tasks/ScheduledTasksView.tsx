"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ScheduledTask, ScheduledTaskStatus, ScheduledTaskType } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import type { WebNotification } from "@/types/notification";
import { TaskCard } from "./TaskCard";
import { TaskFilterBar } from "./TaskFilterBar";
import { TaskTable } from "./TaskTable";

interface ScheduledTasksViewProps {
  initialTasks: ScheduledTask[];
}

interface RunNowApiResponse {
  success: boolean;
  data?: {
    task: ScheduledTask;
    taskRun: TaskRun;
    notification: WebNotification | null;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

function calculateMockNextRun(scheduleType: ScheduledTask["scheduleType"]) {
  const now = new Date();

  const offsetHours: Record<ScheduledTask["scheduleType"], number> = {
    "One Time": 0,
    Hourly: 1,
    Daily: 24,
    Weekly: 24 * 7,
    Monthly: 24 * 30,
    "Custom Cron": 6,
  };

  const hours = offsetHours[scheduleType];
  if (hours === 0) return null;

  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function ScheduledTasksView({ initialTasks }: ScheduledTasksViewProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ScheduledTaskType>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ScheduledTaskStatus>("All");
  const [busyTaskIds, setBusyTaskIds] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Phase 8 พร้อมแล้ว: ปุ่ม Run Now จะเรียก /api/scheduled-tasks/:id/run-now เพื่อสร้าง Task Run + Notification แบบ mock",
  );

  const taskTypes = useMemo(() => {
    return Array.from(new Set(tasks.map((task) => task.type)));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        keyword.length === 0 ||
        [
          task.name,
          task.type,
          task.scheduleType,
          task.status,
          task.timezone,
          task.dataSources.join(" "),
          task.gptActions.join(" "),
          task.outputChannels.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesType = selectedType === "All" || task.type === selectedType;
      const matchesStatus = selectedStatus === "All" || task.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [tasks, search, selectedType, selectedStatus]);

  const activeCount = tasks.filter((task) => task.status === "Active").length;
  const runningCount = tasks.filter((task) => task.status === "Running").length;
  const failedCount = tasks.filter((task) => task.status === "Failed").length;
  const pausedCount = tasks.filter((task) => task.status === "Paused").length;

  async function handleRunNow(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    if (!target || busyTaskIds.includes(taskId)) return;

    setBusyTaskIds((current) => [...current, taskId]);
    setMessage(`กำลังเรียก Run Now API: ${target.name}`);

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "Running",
              isActive: true,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );

    try {
      const response = await fetch(`/api/scheduled-tasks/${taskId}/run-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json()) as RunNowApiResponse;

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message ?? "Run Now failed");
      }

      const { task, taskRun, notification } = payload.data;

      setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
      setMessage(
        `Run Now สำเร็จ: ${task.name} → สร้าง ${taskRun.id}, priority ${taskRun.priorityScore}/100${
          notification ? `, notification ${notification.id}` : ", no notification"
        }`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "Failed",
                isActive: true,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
      setMessage(`Run Now ไม่สำเร็จ: ${errorMessage}`);
    } finally {
      setBusyTaskIds((current) => current.filter((id) => id !== taskId));
    }
  }

  function handleTogglePause(taskId: string) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        const shouldResume = task.status === "Paused";
        setMessage(shouldResume ? `Resume task แล้ว: ${task.name}` : `Pause task แล้ว: ${task.name}`);

        return {
          ...task,
          status: shouldResume ? "Active" : "Paused",
          isActive: shouldResume,
          nextRunAt: shouldResume ? calculateMockNextRun(task.scheduleType) : null,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  function handleDelete(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setMessage(`ลบ task แบบ mock แล้ว: ${target?.name ?? taskId}`);
  }

  function handleResetFilters() {
    setSearch("");
    setSelectedType("All");
    setSelectedStatus("All");
    setMessage("ล้าง filter แล้ว");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 8 Run Now Mock API</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Scheduled Tasks</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              จัดการ Task ทั้งหมดของ NimbusDaily และทดสอบ Run Now ผ่าน API mock ที่จะสร้าง Task Run, GPT Output, Notification และ Telegram status จำลอง
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-400">Task Overview</p>
              <p className="mt-3 text-4xl font-black text-white">{tasks.length}</p>
              <p className="mt-1 text-sm text-slate-500">total scheduled tasks</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
              <p className="font-black text-emerald-100">{activeCount}</p>
              <p className="text-xs text-emerald-100/70">Active</p>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-300/10 p-3">
              <p className="font-black text-violet-100">{runningCount}</p>
              <p className="text-xs text-violet-100/70">Running</p>
            </div>
            <div className="rounded-2xl border border-slate-300/20 bg-slate-300/10 p-3">
              <p className="font-black text-slate-100">{pausedCount}</p>
              <p className="text-xs text-slate-300">Paused</p>
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
              <p className="font-black text-rose-100">{failedCount}</p>
              <p className="text-xs text-rose-100/70">Failed</p>
            </div>
          </div>
        </Card>
      </section>

      <TaskFilterBar
        search={search}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        taskTypes={taskTypes}
        onSearchChange={setSearch}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
      />

      <div className="flex flex-col justify-between gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <div className="flex items-center gap-2">
          <Badge tone="blue">Showing {filteredTasks.length}</Badge>
          <Button className="px-4 py-2 text-xs" variant="secondary" onClick={handleResetFilters} type="button">
            Reset Filter
          </Button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState title="No tasks found" description="ลองล้าง filter หรือค้นหาด้วยชื่อ task / data source / GPT action อื่น" />
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isBusy={busyTaskIds.includes(task.id)}
                onRunNow={handleRunNow}
                onTogglePause={handleTogglePause}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <TaskTable
            tasks={filteredTasks}
            busyTaskIds={busyTaskIds}
            onRunNow={handleRunNow}
            onTogglePause={handleTogglePause}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
