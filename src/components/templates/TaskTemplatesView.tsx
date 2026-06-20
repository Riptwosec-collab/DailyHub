"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { showToast } from "@/components/ui/ToastProvider";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { CreateTaskFromTemplateResult, TaskTemplate } from "@/types/task-template";

const categories = ["All", "Daily Brief", "Email Monitor", "Sale Monitor", "World Cup Recap", "Weekend Ideas", "Concert Alerts", "Custom"];

export function TaskTemplatesView() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null);

  async function loadTemplates() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<TaskTemplate[]>("/api/task-templates");
      setTemplates(data);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = category === "All" || template.type === category;
      const searchableText = [template.name, template.description, template.type, template.tags.join(" "), template.recommendedFor]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !keyword || searchableText.includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [category, search, templates]);

  async function createTask(template: TaskTemplate) {
    setCreatingId(template.id);

    try {
      const result = await apiRequest<CreateTaskFromTemplateResult>(`/api/task-templates/${template.id}/create-task`, {
        method: "POST",
      });
      setCreatedTaskId(result.taskId);
      showToast({
        title: "Task created",
        description: `${result.taskName} ถูกสร้างจาก template แล้ว`,
        tone: "success",
      });
    } catch (createError) {
      showToast({ title: "Create task failed", description: toErrorMessage(createError), tone: "error" });
    } finally {
      setCreatingId(null);
    }
  }

  if (isLoading) return <LoadingState title="Loading templates" description="กำลังโหลด Task Templates" />;

  if (error) return <ErrorState title="Task templates loading failed" description={error} onRetry={loadTemplates} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">Phase 27</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Task Templates</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            เลือก workflow สำเร็จรูปแล้วสร้าง Scheduled Task ได้ทันที เหมาะสำหรับ Daily Brief, Email Monitor, Sale Monitor และ Weekend Ideas
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/scheduled-tasks/create">Create Custom Task</Link>
        </Button>
      </div>

      {createdTaskId && (
        <Card className="flex flex-col gap-3 border-emerald-300/25 bg-emerald-300/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-emerald-100">สร้าง Task สำเร็จแล้ว</p>
            <p className="mt-1 text-xs text-emerald-100/70">เปิดหน้า Scheduled Tasks เพื่อกด Run Now หรือแก้ไขเวลารันได้</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/scheduled-tasks">View Scheduled Tasks</Link>
          </Button>
        </Card>
      )}

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <Input placeholder="Search templates, tags, use cases..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select
            className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filteredTemplates.length === 0 ? (
        <EmptyState title="ไม่พบ Template" description="ลองเปลี่ยนคำค้นหาหรือเลือกประเภทเป็น All" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl">
                  {template.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-white">{template.name}</h2>
                    <Badge tone="blue">{template.type}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Schedule</p>
                  <p className="mt-1 text-sm font-bold text-white">{template.scheduleType}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Time</p>
                  <p className="mt-1 text-sm font-bold text-white">{template.time ?? template.cronExpression ?? "Manual"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Priority</p>
                  <p className="mt-1 text-sm font-bold text-white">{template.minPriorityScore}+</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} tone="gray">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Recommended for</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{template.recommendedFor}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Sources: <span className="font-semibold text-slate-300">{template.dataSources.join(", ")}</span>
                </div>
                <Button disabled={creatingId === template.id} onClick={() => createTask(template)}>
                  {creatingId === template.id ? "Creating..." : "Use Template"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
