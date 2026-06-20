export type UsageEventType =
  | "run_now"
  | "scheduler_tick"
  | "openai_call"
  | "telegram_send"
  | "task_created"
  | "task_deleted"
  | "notification_read";

export interface UsageEvent {
  id: string;
  userId: string | null;
  type: UsageEventType;
  amount: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface UsageLimitStatus {
  key: string;
  label: string;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  isLimited: boolean;
}

export interface AdminUsageMetrics {
  runNowToday: UsageLimitStatus;
  openAiToday: UsageLimitStatus;
  telegramToday: UsageLimitStatus;
  taskCount: UsageLimitStatus;
  events: UsageEvent[];
}
