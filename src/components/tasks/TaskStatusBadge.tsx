import { Badge } from "@/components/ui/Badge";
import type { ScheduledTaskStatus } from "@/types/scheduled-task";

const statusTone: Record<ScheduledTaskStatus, "green" | "gray" | "red" | "purple"> = {
  Active: "green",
  Paused: "gray",
  Failed: "red",
  Running: "purple",
};

export function TaskStatusBadge({ status }: { status: ScheduledTaskStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
}
