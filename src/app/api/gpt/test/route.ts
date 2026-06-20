import { successResponse } from "@/lib/mock-db";
import { scheduledTasks } from "@/lib/mock-data";
import { collectTaskDataSources } from "@/services/data-source.service";
import { buildGptPrompt, generateGptOutput, getOpenAiModeStatus } from "@/services/openai.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const task = scheduledTasks[0];
  const rawInput = await collectTaskDataSources(task);
  const gptPrompt = buildGptPrompt(task, rawInput);
  const gptOutput = await generateGptOutput(task, rawInput);

  return successResponse({
    mode: getOpenAiModeStatus(),
    task: { id: task.id, name: task.name, type: task.type },
    rawInput,
    gptPrompt,
    gptOutput,
  });
}
