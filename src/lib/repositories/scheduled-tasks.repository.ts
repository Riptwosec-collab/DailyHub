import { getMockDb, createId, calculateMockNextRun } from "@/lib/mock-db";
import {
  DEFAULT_TASK_SEEDS,
  buildDefaultScheduledTask,
  getMissingDefaultTaskSeeds,
  isLegacyLongReadTask,
  matchesDefaultTaskSeed,
  mergeDefaultScheduledTasks,
  normalizeDefaultTask,
} from "@/lib/default-scheduled-tasks";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ScheduledTask, ScheduledTaskStatus } from "@/types/scheduled-task";
import { mapTaskRow, mapTaskToRow, type ScheduledTaskRow } from "./mappers";

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

export interface TaskQuery {
  userId?: string;
  search?: string;
  type?: string;
  status?: string;
  isActive?: boolean;
}

export interface CreateTaskInput {
  userId: string;
  name: string;
  type: ScheduledTask["type"];
  scheduleType: ScheduledTask["scheduleType"];
  cronExpression?: string | null;
  time?: string | null;
  timezone?: string;
  dataSources?: string[];
  gptActions?: string[];
  outputChannels?: string[];
  minPriorityScore?: number;
  isActive?: boolean;
}

function isUnfilteredDefaultQuery(query: TaskQuery) {
  return !query.search
    && (!query.type || query.type === "All")
    && (!query.status || query.status === "All")
    && typeof query.isActive !== "boolean";
}

async function ensureSupabaseDefaultTasks(userId: string, existingTasks: ScheduledTask[]) {
  const supabase = createAdminClient();
  const cleanTasks = existingTasks.filter((task) => !isLegacyLongReadTask(task));
  if (!supabase) return mergeDefaultScheduledTasks(cleanTasks, userId);

  const missingSeeds = getMissingDefaultTaskSeeds(cleanTasks);
  if (!missingSeeds.length) {
    return mergeDefaultScheduledTasks(cleanTasks, userId);
  }

  const defaultTasks = missingSeeds.map((seed, index) => buildDefaultScheduledTask(seed, userId, cleanTasks.length + index));
  const { data, error } = await supabase
    .from("scheduled_tasks")
    .insert(defaultTasks.map(mapTaskToRow))
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return mergeDefaultScheduledTasks([...cleanTasks, ...defaultTasks], userId);
  }

  const inserted = (data as ScheduledTaskRow[]).map(mapTaskRow);
  return mergeDefaultScheduledTasks([...cleanTasks, ...inserted], userId);
}

export async function listScheduledTasks(query: TaskQuery = {}) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("scheduled_tasks").select("*").order("created_at", { ascending: false });

    if (query.userId) request = request.eq("user_id", query.userId);
    if (query.type && query.type !== "All") request = request.eq("type", query.type);
    if (query.status && query.status !== "All") request = request.eq("status", query.status);
    if (typeof query.isActive === "boolean") request = request.eq("is_active", query.isActive);
    if (query.search) request = request.ilike("name", `%${query.search}%`);

    const { data, error } = await request;
    if (error) throw error;

    const rows = (data as ScheduledTaskRow[]).map(mapTaskRow).filter((task) => !isLegacyLongReadTask(task));
    if (query.userId && isUnfilteredDefaultQuery(query)) {
      return ensureSupabaseDefaultTasks(query.userId, rows);
    }

    return rows;
  }

  const db = getMockDb();
  const search = query.search?.toLowerCase() ?? "";
  const filtered = db.scheduledTasks.filter((task) => {
    const matchesUser = !query.userId || task.userId === query.userId;
    const matchesType = !query.type || query.type === "All" || task.type === query.type;
    const matchesStatus = !query.status || query.status === "All" || task.status === query.status;
    const matchesActive = typeof query.isActive !== "boolean" || task.isActive === query.isActive;
    const matchesSearch = !search || [task.name, task.type, task.status, task.dataSources.join(" ")].join(" ").toLowerCase().includes(search);
    return matchesUser && matchesType && matchesStatus && matchesActive && matchesSearch && !isLegacyLongReadTask(task);
  });

  if (isUnfilteredDefaultQuery(query)) {
    return mergeDefaultScheduledTasks(filtered, query.userId ?? "user_001");
  }

  return filtered;
}

export async function getScheduledTaskById(id: string, userId?: string) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("scheduled_tasks").select("*").eq("id", id);
    if (userId) request = request.eq("user_id", userId);
    const { data, error } = await request.single();
    if (error || !data) return null;
    const task = mapTaskRow(data as ScheduledTaskRow);
    return isLegacyLongReadTask(task) ? null : task;
  }

  const task = getMockDb().scheduledTasks.find((item) => item.id === id && (!userId || item.userId === userId));
  if (!task || isLegacyLongReadTask(task)) return null;
  return task;
}

export async function createScheduledTask(input: CreateTaskInput) {
  const now = new Date().toISOString();
  const isActive = input.isActive ?? true;

  const task: ScheduledTask = {
    id: createId("task"),
    userId: input.userId,
    name: input.name,
    type: input.type,
    scheduleType: input.scheduleType,
    cronExpression: input.cronExpression ?? "0 8 * * *",
    time: input.time ?? null,
    timezone: input.timezone ?? "Asia/Bangkok",
    dataSources: input.dataSources ?? ["News"],
    gptActions: input.gptActions ?? ["Summarize"],
    outputChannels: input.outputChannels ?? ["Save to Web Dashboard"],
    minPriorityScore: Math.min(Math.max(input.minPriorityScore ?? 70, 0), 100),
    status: isActive ? "Active" : "Paused",
    isActive,
    lastRunAt: null,
    nextRunAt: isActive ? calculateMockNextRun(input.scheduleType) : null,
    createdAt: now,
    updatedAt: now,
  };

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const matchingSeed = DEFAULT_TASK_SEEDS.find((seed) => matchesDefaultTaskSeed(task, seed));
    const taskToCreate = matchingSeed ? normalizeDefaultTask(task, matchingSeed) : task;
    const { data, error } = await supabase.from("scheduled_tasks").insert(mapTaskToRow(taskToCreate)).select("*").single();
    if (error) throw error;
    return mapTaskRow(data as ScheduledTaskRow);
  }

  getMockDb().scheduledTasks.unshift(task);
  return task;
}

export async function updateScheduledTask(id: string, patch: Partial<ScheduledTask>, userId?: string) {
  const updatedAt = new Date().toISOString();

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("scheduled_tasks").update(mapTaskToRow({ ...patch, updatedAt })).eq("id", id);
    if (userId) request = request.eq("user_id", userId);
    const { data, error } = await request.select("*").single();
    if (error || !data) return null;
    const task = mapTaskRow(data as ScheduledTaskRow);
    return isLegacyLongReadTask(task) ? null : task;
  }

  const db = getMockDb();
  const index = db.scheduledTasks.findIndex((item) => item.id === id && (!userId || item.userId === userId));
  if (index === -1 || isLegacyLongReadTask(db.scheduledTasks[index])) return null;
  db.scheduledTasks[index] = { ...db.scheduledTasks[index], ...patch, updatedAt };
  return db.scheduledTasks[index];
}

export async function deleteScheduledTask(id: string, userId?: string) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("scheduled_tasks").delete().eq("id", id);
    if (userId) request = request.eq("user_id", userId);
    const { error } = await request.select("id").single();
    return !error;
  }

  const db = getMockDb();
  const before = db.scheduledTasks.length;
  db.scheduledTasks = db.scheduledTasks.filter((task) => !(task.id === id && (!userId || task.userId === userId)));
  db.taskRuns = db.taskRuns.filter((run) => run.taskId !== id);
  db.webNotifications = db.webNotifications.filter((item) => item.taskId !== id);
  return db.scheduledTasks.length < before;
}

export async function listDueScheduledTasks(nowIso = new Date().toISOString()) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase
      .from("scheduled_tasks")
      .select("*")
      .eq("is_active", true)
      .lte("next_run_at", nowIso)
      .order("next_run_at", { ascending: true })
      .limit(25);
    if (error) throw error;
    return (data as ScheduledTaskRow[]).map(mapTaskRow).filter((task) => !isLegacyLongReadTask(task));
  }

  return getMockDb().scheduledTasks.filter((task) => task.isActive && task.nextRunAt && task.nextRunAt <= nowIso && !isLegacyLongReadTask(task));
}

export function isValidStatus(value: string): value is ScheduledTaskStatus {
  return ["Active", "Paused", "Failed", "Running"].includes(value);
}
