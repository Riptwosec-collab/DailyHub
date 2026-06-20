import { createAuditLog, listAuditLogs } from "@/lib/repositories/audit-logs.repository";
import type { CreateAuditLogInput } from "@/types/audit-log";
import { serverLogger } from "@/lib/logger";

export async function audit(input: CreateAuditLogInput) {
  const log = await createAuditLog(input);

  if (input.level === "error") {
    serverLogger.error(input.message, {
      auditId: log.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
      metadata: input.metadata ?? null,
    });
  } else {
    serverLogger.info(input.message, {
      auditId: log.id,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      requestId: input.requestId ?? null,
    });
  }

  return log;
}

export async function getAuditLogs(options?: Parameters<typeof listAuditLogs>[0]) {
  return listAuditLogs(options);
}
