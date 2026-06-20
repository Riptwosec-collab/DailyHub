import { rateLimited } from "@/lib/api/response";
import type { UsageEvent, UsageEventType, UsageLimitStatus } from "@/types/usage";

declare global {
  // eslint-disable-next-line no-var
  var dailyHubUsageEvents: UsageEvent[] | undefined;
}

function getStore() {
  if (!globalThis.dailyHubUsageEvents) globalThis.dailyHubUsageEvents = [];
  return globalThis.dailyHubUsageEvents;
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

export function recordUsageEvent(input: {
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

  const store = getStore();
  store.unshift(event);
  if (store.length > 1000) store.splice(1000);
  return event;
}

export function listUsageEvents(limit = 100) {
  return getStore().slice(0, limit);
}

export function countUsageToday(type: UsageEventType, userId?: string | null) {
  const today = startOfToday();
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

export function assertDailyUsageLimit(input: {
  type: UsageEventType;
  label: string;
  limitEnvName: string;
  fallbackLimit: number;
  userId?: string | null;
}) {
  if (!isUsageLimitsEnabled()) return;

  const limit = getNumberEnv(input.limitEnvName, input.fallbackLimit);
  const used = countUsageToday(input.type, input.userId);

  if (used >= limit) {
    throw rateLimited(`${input.label} reached daily limit ${used}/${limit}. Try again tomorrow.`);
  }
}
