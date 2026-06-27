import { rateLimited } from "@/lib/api/response";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UsageEvent, UsageEventType, UsageLimitStatus } from "@/types/usage";

declare global {
  // eslint-disable-next-line no-var
  var dailyHubUsageEvents: UsageEvent[] | undefined;
}

function getStore() {
  if (!globalThis.dailyHubUsageEvents) globalThis.dailyHubUsageEvents = [];
  return globalThis.dailyHubUsageEvents;
}

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

function createId() {
  return `usage_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
}

export function isUsageLimitsEnabled() {
  return process.env.ENABLE_USAGE_LIMITS !== "false";
}

export function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function mapUsageRow(row: {
  id: string;
  user_id: string | null;
  type: UsageEventType;
  amount: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}): UsageEvent {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: row.amount,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function recordUsageEvent(input: {
  userId?: string | null;
  type: UsageEventType;
  amount?: number;
  metadata?: Record<string, unknown> | null;
}) {
  const event: UsageEvent = {
    id: createId(),
    userId: input.userId ?? null,
    type: input.type,
    amount: input.amount ?? 1,
    metadata: input.metadata ?? null,
    createdAt: new Date().toISOString(),
  };

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase
      .from("usage_events")
      .insert({
        user_id: event.userId,
        type: event.type,
        amount: event.amount,
        metadata: event.metadata ?? {},
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapUsageRow(data);
  }

  const store = getStore();
  store.unshift(event);
  if (store.length > 1000) store.splice(1000);
  return event;
}

export async function listUsageEvents(limit = 100) {
  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase.from("usage_events").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data.map(mapUsageRow);
  }

  return getStore().slice(0, limit);
}

export async function countUsageToday(type: UsageEventType, userId?: string | null) {
  const today = startOfToday();

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase
      .from("usage_events")
      .select("amount")
      .eq("type", type)
      .gte("created_at", today);

    if (userId) request = request.eq("user_id", userId);
    const { data, error } = await request;
    if (error) throw error;
    return data.reduce((sum, event) => sum + Number(event.amount ?? 0), 0);
  }

  return getStore()
    .filter((event) => event.type === type)
    .filter((event) => !userId || event.userId === userId)
    .filter((event) => event.createdAt >= today)
    .reduce((sum, event) => sum + event.amount, 0);
}

export function createUsageStatus({
  key,
  label,
  used,
  limit,
}: {
  key: string;
  label: string;
  used: number;
  limit: number;
}): UsageLimitStatus {
  return {
    key,
    label,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    resetAt: endOfToday(),
    isLimited: used >= limit,
  };
}

export async function assertDailyUsageLimit(input: {
  type: UsageEventType;
  label: string;
  limitEnvName: string;
  fallbackLimit: number;
  userId?: string | null;
}) {
  if (!isUsageLimitsEnabled()) return;

  const limit = getNumberEnv(input.limitEnvName, input.fallbackLimit);
  const used = await countUsageToday(input.type, input.userId);

  if (used >= limit) {
    throw rateLimited(`${input.label} reached daily limit ${used}/${limit}. Try again tomorrow.`);
  }
}
