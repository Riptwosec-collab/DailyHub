import { rateLimited } from "@/lib/api/response";
import { createAdminClient } from "@/lib/supabase/admin";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var dailyHubRateLimitStore: Map<string, RateLimitRecord> | undefined;
}

function getStore() {
  if (!globalThis.dailyHubRateLimitStore) {
    globalThis.dailyHubRateLimitStore = new Map<string, RateLimitRecord>();
  }

  return globalThis.dailyHubRateLimitStore;
}

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const store = getStore();
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt,
  };
}

export async function checkPersistentRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  if (!shouldUseSupabase()) return checkRateLimit({ key, limit, windowMs });

  const supabase = createAdminClient()!;
  const now = Date.now();
  const windowStart = new Date(now - windowMs).toISOString();
  const resetAt = now + windowMs;

  await supabase.from("rate_limit_events").delete().lt("created_at", new Date(now - windowMs * 2).toISOString());

  const { count, error: countError } = await supabase
    .from("rate_limit_events")
    .select("*", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if (countError) throw countError;

  if ((count ?? 0) >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  const { error: insertError } = await supabase.from("rate_limit_events").insert({ key });
  if (insertError) throw insertError;

  return {
    allowed: true,
    remaining: Math.max(limit - (count ?? 0) - 1, 0),
    resetAt,
  };
}

export async function assertRateLimit(options: RateLimitOptions) {
  const result = await checkPersistentRateLimit(options);

  if (!result.allowed) {
    const retryAfterSeconds = Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1);
    throw rateLimited(`Too many requests. Please try again in ${retryAfterSeconds} seconds.`);
  }

  return result;
}

export function getRateLimitStats() {
  const store = getStore();
  return {
    keys: store.size,
  };
}
