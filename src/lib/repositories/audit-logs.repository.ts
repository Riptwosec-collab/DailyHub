import type { AuditLog, CreateAuditLogInput } from "@/types/audit-log";
import { redactSecrets } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

declare global {
  // eslint-disable-next-line no-var
  var dailyHubAuditLogs: AuditLog[] | undefined;
}

function getAuditStore() {
  if (!globalThis.dailyHubAuditLogs) {
    globalThis.dailyHubAuditLogs = [];
  }

  return globalThis.dailyHubAuditLogs;
}

function createId() {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function shouldUseSupabase() {
  return process.env.USE_SUPABASE === "true" && Boolean(createAdminClient());
}

function mapAuditRow(row: {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  level: AuditLog["level"];
  message: string;
  metadata: Record<string, unknown> | null;
  request_id: string | null;
  created_at: string;
}): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    level: row.level,
    message: row.message,
    metadata: row.metadata,
    requestId: row.request_id,
    createdAt: row.created_at,
  };
}

export async function createAuditLog(input: CreateAuditLogInput) {
  const log: AuditLog = {
    id: createId(),
    userId: input.userId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    level: input.level ?? "info",
    message: input.message,
    metadata: input.metadata ? redactSecrets(input.metadata) : null,
    requestId: input.requestId ?? null,
    createdAt: new Date().toISOString(),
  };

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: log.userId,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        level: log.level,
        message: log.message,
        metadata: log.metadata ?? {},
        request_id: log.requestId,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapAuditRow(data);
  }

  const store = getAuditStore();
  store.unshift(log);

  // Keep memory bounded in local/serverless mock mode.
  if (store.length > 500) store.splice(500);

  return log;
}

export async function listAuditLogs(options?: {
  entityType?: string | null;
  entityId?: string | null;
  level?: string | null;
  limit?: number;
}) {
  const limit = options?.limit ?? 100;

  if (shouldUseSupabase()) {
    const supabase = createAdminClient()!;
    let request = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);

    if (options?.entityType) request = request.eq("entity_type", options.entityType);
    if (options?.entityId) request = request.eq("entity_id", options.entityId);
    if (options?.level) request = request.eq("level", options.level);

    const { data, error } = await request;
    if (error) throw error;
    return data.map(mapAuditRow);
  }

  const store = getAuditStore();

  return store
    .filter((log) => !options?.entityType || log.entityType === options.entityType)
    .filter((log) => !options?.entityId || log.entityId === options.entityId)
    .filter((log) => !options?.level || log.level === options.level)
    .slice(0, limit);
}
