import type { ScheduleType, ScheduledTaskType } from "@/types/scheduled-task";

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: ScheduledTaskType;
  scheduleType: ScheduleType;
  cronExpression: string | null;
  time: string | null;
  timezone: string;
  dataSources: string[];
  gptActions: string[];
  outputChannels: string[];
  minPriorityScore: number;
  tags: string[];
  icon: string;
  recommendedFor: string;
}

export interface CreateTaskFromTemplateResult {
  template: TaskTemplate;
  taskId: string;
  taskName: string;
}
