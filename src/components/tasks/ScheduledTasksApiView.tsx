"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask, ScheduledTaskStatus, ScheduledTaskType } from "@/types/scheduled-task";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Select } from "@/components/ui/Select";
import { PriorityScoreBadge } from "./PriorityScoreBadge";
import { TaskStatusBadge } from "./TaskStatusBadge";

const statuses: Array<"All" | ScheduledTaskStatus> = ["All", "Active", "Running", "Paused", "Failed"];

export function ScheduledTasksApiView() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | ScheduledTaskType>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ScheduledTaskStatus>("All");
  const [busyTaskIds, setBusyTaskIds] = useState<string[]>([]);
  const [message, setMessage] = useState("รายการงานพร้อมใช้งาน");

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ScheduledTask[]>("/api/scheduled-tasks");
      setTasks(data);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const taskTypes = useMemo(() => Array.from(new Set(tasks.map((task) => task.type))), [tasks]);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        keyword.length === 0 ||
        [task.name, task.type, task.scheduleType, task.status, task.dataSources.join(" "), task.gptActions.join(" ")]
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
  const pausedCount = tasks.filter((task) => task.status === "Paused").length;
  const failedCount = tasks.filter((task) => task.status === "Failed").length;

  async function handleRunNow(task: ScheduledTask) {
    setBusyTaskIds((current) => [...current, task.id]);
    setMessage(`กำลังเรียก Run Now API: ${task.name}`);
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status: "Running" } : item)));

    try {
      const result = await apiRequest<{ task: ScheduledTask }>(`/api/scheduled-tasks/${task.id}/run-now`, {
        method: "POST",
      });
      setTasks((current) => current.map((item) => (item.id === task.id ? result.task : item)));
      setMessage(`Run Now สำเร็จผ่าน API: ${result.task.name}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
      await loadTasks();
    } finally {
      setBusyTaskIds((current) => current.filter((id) => id !== task.id));
    }
  }

  async function handleTogglePause(task: ScheduledTask) {
    const shouldResume = task.status === "Paused";
    const payload = {
      status: shouldResume ? "Active" : "Paused",
      isActive: shouldResume,
      is_active: shouldResume,
    };

    setBusyTaskIds((current) => [...current, task.id]);
    try {
      const updatedTask = await apiRequest<ScheduledTask>(`/api/scheduled-tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)));
      setMessage(`${shouldResume ? "Resume" : "Pause"} สำเร็จผ่าน API: ${updatedTask.name}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setBusyTaskIds((current) => current.filter((id) => id !== task.id));
    }
  }

  async function handleDelete(task: ScheduledTask) {
    setBusyTaskIds((current) => [...current, task.id]);
    try {
      await apiRequest(`/api/scheduled-tasks/${task.id}`, { method: "DELETE" });
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setMessage(`ลบ task สำเร็จผ่าน API: ${task.name}`);
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setBusyTaskIds((current) => current.filter((id) => id !== task.id));
    }
  }

  if (isLoading) return <LoadingState title="Loading scheduled tasks" description="กำลังดึงรายการ task จาก /api/scheduled-tasks" />;
  if (error) {
    return (
      <ErrorState
        title="Scheduled tasks loading failed"
        description={error}
        onRetry={loadTasks}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="relative">
            <Badge tone="purple">Automation</Badge>
            <h1 className="mt-4 text-3xl font-black text-white">Scheduled Tasks</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              จัดการงานอัตโนมัติ ตรวจรอบทำงาน และสั่งเริ่มหรือพักงานจากจุดเดียว
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-400">Task Overview</p>
              <p className="mt-3 text-4xl font-black text-white">{tasks.length}</p>
              <p className="mt-1 text-sm text-slate-500">งานทั้งหมดในระบบ</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <MiniStat label="Active" value={activeCount} tone="emerald" />
            <MiniStat label="Running" value={runningCount} tone="violet" />
            <MiniStat label="Paused" value={pausedCount} tone="slate" />
            <MiniStat label="Failed" value={failedCount} tone="rose" />
          </div>
        </Card>
      </section>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_220px_180px_auto]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search task name, source, GPT action..." />
        <Select value={selectedType} onChange={(event) => setSelectedType(event.target.value as "All" | ScheduledTaskType)}>
          <option value="All">All task types</option>
          {taskTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </Select>
        <Select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as "All" | ScheduledTaskStatus)}>
          {statuses.map((status) => <option key={status} value={status}>{status === "All" ? "All status" : status}</option>)}
        </Select>
        <Button variant="secondary" onClick={loadTasks} type="button">Refresh</Button>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300 sm:flex-row sm:items-center">
        <p>{message}</p>
        <Badge tone="blue">Showing {filteredTasks.length}</Badge>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState title="No tasks found" description="ลองล้าง filter หรือสร้าง task ใหม่" />
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => {
            const isBusy = busyTaskIds.includes(task.id);
            return (
              <Card key={task.id} className="p-5">
                <div className="grid gap-5 lg:grid-cols-[1fr_220px_240px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <PriorityScoreBadge score={task.minPriorityScore} />
                      <Badge tone="gray">{task.scheduleType}</Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-black text-white">{task.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{task.type} • {task.timezone}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.dataSources.map((source) => <Badge key={source} tone="blue">{source}</Badge>)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-400">
                    <p>Next Run: {formatDateTime(task.nextRunAt)}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Button disabled={isBusy} onClick={() => void handleRunNow(task)} type="button">
                      {isBusy && task.status === "Running" ? "Running..." : "Run Now"}
                    </Button>
                    <Button disabled={isBusy} variant="secondary" onClick={() => void handleTogglePause(task)} type="button">
                      {task.status === "Paused" ? "Resume" : "Pause"}
                    </Button>
                    <Button disabled={isBusy} variant="danger" onClick={() => void handleDelete(task)} type="button">
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "violet" | "slate" | "rose" }) {
  const className = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    violet: "border-violet-300/20 bg-violet-300/10 text-violet-100",
    slate: "border-slate-300/20 bg-slate-300/10 text-slate-100",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  }[tone];

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <p className="font-black">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
