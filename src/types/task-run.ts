export type TaskRunStatus = "success" | "failed" | "running";

export interface GptOutput {
  title: string;
  summary: string;
  priority_score: number;
  recommended_action: string;
  caption: string | null;
  image_prompt: string | null;
}

export interface TaskRun {
  id: string;
  taskId: string;
  status: TaskRunStatus;
  startedAt: string;
  finishedAt: string | null;
  rawInput: Record<string, unknown>;
  gptPrompt: string;
  gptOutput: GptOutput;
  priorityScore: number;
  telegramStatus: string;
  errorMessage: string | null;
}
