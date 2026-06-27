import { getMockDb } from "@/lib/mock-db";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaskRun } from "@/types/task-run";
import { mapRunRow, mapRunToRow, type TaskRunRow } from "./mappers";

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

export interface RunQuery {
  userId?: string;
  taskId?: string;
  status?: string;
}

export async function listTaskRuns(query: RunQuery = {}) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("task_runs").select("*").order("started_at", { ascending: false });
    if (query.taskId) request = request.eq("task_id", query.taskId);
    if (query.status && query.status !== "All") request = request.eq("status", query.status);
    if (query.userId) {
      const { data: tasks, error: taskError } = await supabase.from("scheduled_tasks").select("id").eq("user_id", query.userId);
      if (taskError) throw taskError;
      const ids = (tasks ?? []).map((item) => item.id);
      if (ids.length === 0) return [];
      request = request.in("task_id", ids);
    }
    const { data, error } = await request;
    if (error) throw error;
    return (data as TaskRunRow[]).map(mapRunRow);
  }

  return getMockDb().taskRuns.filter((run) => {
    const matchesTask = !query.taskId || run.taskId === query.taskId;
    const matchesStatus = !query.status || query.status === "All" || run.status === query.status;
    return matchesTask && matchesStatus;
  });
}

export async function getTaskRunById(id: string, userId?: string) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const request = supabase.from("task_runs").select("*").eq("id", id).single();
    const { data, error } = await request;
    if (error || !data) return null;
    const run = mapRunRow(data as TaskRunRow);
    if (!userId) return run;
    const { data: task } = await supabase.from("scheduled_tasks").select("user_id").eq("id", run.taskId).single();
    return task?.user_id === userId ? run : null;
  }

  return getMockDb().taskRuns.find((run) => run.id === id) ?? null;
}

export async function createTaskRun(run: TaskRun) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase.from("task_runs").insert(mapRunToRow(run)).select("*").single();
    if (error) throw error;
    return mapRunRow(data as TaskRunRow);
  }

  getMockDb().taskRuns.unshift(run);
  return run;
}

export async function updateTaskRun(id: string, patch: Partial<TaskRun>) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase.from("task_runs").update(mapRunToRow(patch)).eq("id", id).select("*").single();
    if (error || !data) return null;
    return mapRunRow(data as TaskRunRow);
  }

  const db = getMockDb();
  const index = db.taskRuns.findIndex((run) => run.id === id);
  if (index === -1) return null;
  db.taskRuns[index] = { ...db.taskRuns[index], ...patch };
  return db.taskRuns[index];
}
