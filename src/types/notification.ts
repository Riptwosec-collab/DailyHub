export type NotificationCategory =
  | "Daily Brief"
  | "Email"
  | "Sale"
  | "Football"
  | "Long Read"
  | "Concert"
  | "Weekend"
  | "Custom";

export interface WebNotification {
  id: string;
  userId: string;
  taskId: string;
  taskRunId: string;
  title: string;
  summary: string;
  type: string;
  priorityScore: number;
  isRead: boolean;
  createdAt: string;
}
