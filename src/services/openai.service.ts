import type { ScheduledTask } from "@/types/scheduled-task";
import type { GptOutput } from "@/types/task-run";

export function getOpenAiModeStatus() {
  const enabled = process.env.ENABLE_OPENAI === "true";
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  return {
    mode: enabled && hasApiKey ? "real" : "mock",
    enabled,
    hasApiKey,
    model: process.env.OPENAI_MODEL || "gpt-5.5",
  };
}

export function buildGptPrompt(task: ScheduledTask, rawInput: Record<string, unknown>) {
  return `You are DailyHub AI.
Task Name: ${task.name}
Task Type: ${task.type}
Data Sources: ${task.dataSources.join(", ")}
GPT Actions: ${task.gptActions.join(", ")}
Minimum Priority Score for alerts: ${task.minPriorityScore}

Analyze the raw input and return JSON only.
Required JSON format:
{
  "title": string,
  "summary": string,
  "priority_score": number,
  "recommended_action": string,
  "caption": string | null,
  "image_prompt": string | null
}

Rules:
- priority_score must be 0-100.
- Do not invent facts not present in raw input.
- Keep summary concise and useful for a dashboard.
- If content creation is requested, include caption and image_prompt.

Raw Input:
${JSON.stringify(rawInput, null, 2)}`;
}

export function buildFailedGptOutput(task: ScheduledTask, errorMessage: string): GptOutput {
  return {
    title: `${task.name} failed`,
    summary: `ไม่สามารถสร้าง GPT output ได้: ${errorMessage}`,
    priority_score: 0,
    recommended_action: "ตรวจสอบ OpenAI API key, model, network หรือ raw input แล้วลอง Run Now ใหม่",
    caption: null,
    image_prompt: null,
  };
}

export function generateMockGptOutput(task: ScheduledTask, rawInput?: Record<string, unknown>): GptOutput {
  const sourceCount = Array.isArray(rawInput?.sources) ? rawInput.sources.length : task.dataSources.length;
  const priority = task.type === "Email Monitor" ? 88 : task.type === "Sale Monitor" ? 84 : task.type === "World Cup Recap" ? 72 : 78;

  return {
    title: `${task.name} Summary`,
    summary: `Mock GPT วิเคราะห์ ${sourceCount} data source สำหรับ ${task.type} แล้ว สรุปข้อมูลสำคัญและคำแนะนำพร้อมแสดงใน Dashboard`,
    priority_score: priority,
    recommended_action: priority >= task.minPriorityScore ? "ควรส่งแจ้งเตือนและเปิดดูรายละเอียดใน Task Results" : "บันทึกไว้ใน Dashboard แต่ยังไม่จำเป็นต้องแจ้งเตือนทันที",
    caption: task.gptActions.includes("Generate Caption") ? `อัปเดตจาก ${task.name}: สรุปสั้นพร้อมใช้โพสต์` : null,
    image_prompt: task.gptActions.includes("Generate Image Prompt") ? "9:16 modern SaaS dashboard content card, dark glassmorphism, neon blue purple glow" : null,
  };
}

function parseOpenAiOutput(json: unknown): string {
  const response = json as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof response.output_text === "string") return response.output_text;

  const text = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && typeof content.text === "string")?.text;

  if (text) return text;
  throw new Error("OpenAI response did not contain output text");
}

function normalizeGptOutput(value: unknown, task: ScheduledTask): GptOutput {
  const object = value as Partial<GptOutput>;
  const score = Math.min(Math.max(Number(object.priority_score ?? 0), 0), 100);

  return {
    title: typeof object.title === "string" && object.title ? object.title : `${task.name} Summary`,
    summary: typeof object.summary === "string" ? object.summary : "No summary returned",
    priority_score: Number.isFinite(score) ? score : 0,
    recommended_action: typeof object.recommended_action === "string" ? object.recommended_action : "Review the result in Dashboard",
    caption: typeof object.caption === "string" ? object.caption : null,
    image_prompt: typeof object.image_prompt === "string" ? object.image_prompt : null,
  };
}

export async function generateGptOutput(task: ScheduledTask, rawInput: Record<string, unknown>): Promise<GptOutput> {
  const enabled = process.env.ENABLE_OPENAI === "true";
  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = process.env.OPENAI_FALLBACK_TO_MOCK !== "false";

  if (!enabled || !apiKey) return generateMockGptOutput(task, rawInput);

  const prompt = buildGptPrompt(task, rawInput);
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
        text: { format: { type: "json_object" } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API failed ${response.status}: ${text.slice(0, 300)}`);
    }

    const json = await response.json();
    const outputText = parseOpenAiOutput(json);
    return normalizeGptOutput(JSON.parse(outputText), task);
  } catch (error) {
    if (fallback) return generateMockGptOutput(task, rawInput);
    throw error;
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
