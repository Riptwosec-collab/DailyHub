export type AuditLogLevel = "info" | "warn" | "error";

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  level: AuditLogLevel;
  message: string;
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  createdAt: string;
}

export interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  level?: AuditLogLevel;
  message: string;
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
}
