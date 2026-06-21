import type { ScheduledTask } from "@/types/scheduled-task";
import type { GptOutput } from "@/types/task-run";

type AiProvider = "groq" | "openai" | "mock";

type AiConfig = {
  provider: AiProvider;
  enabled: boolean;
  hasApiKey: boolean;
  apiKey?: string;
  baseUrl?: string;
  model: string;
};

function resolveAiConfig(): AiConfig {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase();
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const useGroq = preferredProvider === "groq" || (!preferredProvider && Boolean(groqKey));

  if (useGroq) {
    return {
      provider: groqKey ? "groq" : "mock",
      enabled: process.env.ENABLE_GROQ === "true" || process.env.ENABLE_AI === "true",
      hasApiKey: Boolean(groqKey),
      apiKey: groqKey,
      baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }

  return {
    provider: openAiKey ? "openai" : "mock",
    enabled: process.env.ENABLE_OPENAI === "true" || process.env.ENABLE_AI === "true",
    hasApiKey: Boolean(openAiKey),
    apiKey: openAiKey,
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-5.5",
  };
}

function getPromptTaskIdentity(task: ScheduledTask) {
  if (task.type === "Sale Monitor") {
    return {
      name: "สินค้าออกใหม่/น่าสนใจจากทั่วโลก",
      type: "Global Product Radar",
      instruction:
        "This task is NOT a Shopee discount monitor. Focus on newly launched, trending, unusual, or globally interesting products. Do not frame the result as coupons, discounts, or Shopee deals.",
    };
  }

  return {
    name: task.name,
    type: task.type,
    instruction: "Use the task type and raw input as the main context.",
  };
}

export function getOpenAiModeStatus() {
  const config = resolveAiConfig();

  return {
    mode: config.enabled && config.hasApiKey ? "real" : "mock",
    provider: config.provider,
    enabled: config.enabled,
    hasApiKey: config.hasApiKey,
    model: config.model,
  };
}

export function buildGptPrompt(task: ScheduledTask, rawInput: Record<string, unknown>) {
  const identity = getPromptTaskIdentity(task);

  return `You are Nimbus Daily.
Task Name: ${identity.name}
Task Type: ${identity.type}
Task Instruction: ${identity.instruction}
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
- For Global Product Radar, write in Thai, organize the result around why each product is interesting, who it is for, what to check before buying, and one content angle.
- Return valid JSON only. Do not wrap the JSON in markdown.

Raw Input:
${JSON.stringify(rawInput, null, 2)}`;
}

export function buildFailedGptOutput(task: ScheduledTask, errorMessage: string): GptOutput {
  return {
    title: `${task.name} failed`,
    summary: `ไม่สามารถสร้าง AI output ได้: ${errorMessage}`,
    priority_score: 0,
    recommended_action: "ตรวจสอบ AI provider, API key, model, network หรือ raw input แล้วลอง Run Now ใหม่",
    caption: null,
    image_prompt: null,
  };
}

export function generateMockGptOutput(task: ScheduledTask, rawInput?: Record<string, unknown>): GptOutput {
  const sourceCount = Array.isArray(rawInput?.sources) ? rawInput.sources.length : task.dataSources.length;
  const priority = task.type === "Email Monitor" ? 88 : task.type === "Sale Monitor" ? 90 : task.type === "World Cup Recap" ? 72 : 78;

  if (task.type === "Sale Monitor") {
    return {
      title: "สินค้าออกใหม่/น่าสนใจจากทั่วโลก",
      summary: `คัดสินค้าและแกดเจ็ตที่กำลังน่าสนใจจาก ${sourceCount} แหล่งข้อมูลทั่วโลก พร้อมเหตุผล กลุ่มผู้ใช้ จุดเด่น ข้อควรเช็ก และไอเดียทำคอนเทนต์`,
      priority_score: priority,
      recommended_action: "เลือก 1-2 ชิ้นที่เข้ากับกลุ่มเป้าหมาย แล้วทำโพสต์รีวิว/คัดของน่าสนใจ โดยไม่เน้น Shopee หรือโปรลดราคา",
      caption: "สินค้าใหม่/ของน่าสนใจจากทั่วโลกที่ควรจับตา 🌍✨",
      image_prompt: "9:16 global product radar card, curated gadgets from around the world, clean Thai sections, modern dark glass UI, neon blue purple glow",
    };
  }

  return {
    title: `${task.name} Summary`,
    summary: `Mock AI วิเคราะห์ ${sourceCount} data source สำหรับ ${task.type} แล้ว สรุปข้อมูลสำคัญและคำแนะนำพร้อมแสดงใน Dashboard`,
    priority_score: priority,
    recommended_action: priority >= task.minPriorityScore ? "ควรส่งแจ้งเตือนและเปิดดูรายละเอียดใน Task Results" : "บันทึกไว้ใน Dashboard แต่ยังไม่จำเป็นต้องแจ้งเตือนทันที",
    caption: task.gptActions.includes("Generate Caption") ? `อัปเดตจาก ${task.name}: สรุปสั้นพร้อมใช้โพสต์` : null,
    image_prompt: task.gptActions.includes("Generate Image Prompt") ? "9:16 modern SaaS dashboard content card, dark glassmorphism, neon blue purple glow" : null,
  };
}

function extractJsonObject(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) return cleaned.slice(firstBrace, lastBrace + 1);
  return cleaned;
}

function parseChatCompletionOutput(json: unknown): string {
  const response = json as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const text = response.choices?.[0]?.message?.content;
  if (typeof text === "string" && text.trim()) return text;

  throw new Error("AI response did not contain chat completion text");
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
  const config = resolveAiConfig();
  const fallback = process.env.AI_FALLBACK_TO_MOCK !== "false" && process.env.OPENAI_FALLBACK_TO_MOCK !== "false";

  if (!config.enabled || !config.apiKey || !config.baseUrl) return generateMockGptOutput(task, rawInput);

  const prompt = buildGptPrompt(task, rawInput);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: "You return valid JSON only. Do not use markdown fences.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${config.provider} API failed ${response.status}: ${text.slice(0, 300)}`);
    }

    const json = await response.json();
    const outputText = parseChatCompletionOutput(json);
    return normalizeGptOutput(JSON.parse(extractJsonObject(outputText)), task);
  } catch (error) {
    if (fallback) return generateMockGptOutput(task, rawInput);
    throw error;
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
