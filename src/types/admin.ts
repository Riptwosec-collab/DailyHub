import type { AuditLog } from "@/types/audit-log";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import type { AdminUsageMetrics } from "@/types/usage";

export interface AdminMetrics {
  totals: {
    tasks: number;
    activeTasks: number;
    taskRuns: number;
    successRuns: number;
    failedRuns: number;
    runningRuns: number;
    notifications: number;
    unreadNotifications: number;
    auditLogs: number;
  };
  health: {
    openAiMode: string;
    telegramMode: string;
    schedulerEnabled: boolean;
    supabaseEnabled: boolean;
    usageLimitsEnabled: boolean;
  };
  latest: {
    tasks: ScheduledTask[];
    runs: TaskRun[];
    notifications: WebNotification[];
    auditLogs: AuditLog[];
  };
  usage: AdminUsageMetrics;
}
