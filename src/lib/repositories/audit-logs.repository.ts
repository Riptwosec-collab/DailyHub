import type { AuditLog, CreateAuditLogInput } from "@/types/audit-log";
import { redactSecrets } from "@/lib/logger";

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
  const store = getAuditStore();
  const limit = options?.limit ?? 100;

  return store
    .filter((log) => !options?.entityType || log.entityType === options.entityType)
    .filter((log) => !options?.entityId || log.entityId === options.entityId)
    .filter((log) => !options?.level || log.level === options.level)
    .slice(0, limit);
}
