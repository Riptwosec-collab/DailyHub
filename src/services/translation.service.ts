import type { ScheduledTask } from "@/types/scheduled-task";
import type { GptOutput } from "@/types/task-run";
import type { ContentLanguage, DashboardTranslatedResult, TranslatedResult, TranslationInput } from "@/types/translation";

const MAX_ORIGINAL_LENGTH = 12000;
const MAX_TELEGRAM_LENGTH = 3600;

function truncateText(text: string, maxLength = MAX_ORIGINAL_LENGTH) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n... [truncated ${text.length - maxLength} chars]`;
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? "");
  }
}

function cleanLines(text: string) {
  return text
    .split(/\r?\n|\u2022|-/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractBullets(text: string, maxItems = 5) {
  const lines = cleanLines(text);
  if (lines.length > 1) return lines.slice(0, maxItems).map((line) => line.slice(0, 240));

  return text
    .split(/[.!?。！？]\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((sentence) => sentence.slice(0, 240));
}

function buildOriginalContent(input: TranslationInput) {
  const parts = [
    input.title ? `Title: ${input.title}` : "",
    input.source ? `Source: ${input.source}` : "",
    input.gptOutput?.summary ? `GPT Summary: ${input.gptOutput.summary}` : "",
    input.gptOutput?.recommended_action ? `Recommended Action: ${input.gptOutput.recommended_action}` : "",
    input.content ? `Content: ${input.content}` : "",
    input.rawInput ? `Raw Input: ${safeStringify(input.rawInput)}` : "",
  ].filter(Boolean);

  return truncateText(parts.join("\n\n"));
}

function normalizeThaiFallback(input: TranslationInput, originalLanguage: ContentLanguage, originalContent: string): TranslatedResult {
  const title = input.gptOutput?.title || input.title || "DailyHub AI Result";
  const summary = input.gptOutput?.summary || input.content || "ยังไม่มีรายละเอียดจากแหล่งข้อมูล";
  const bullets = extractBullets(summary || originalContent);

  const translatedTitle = /[\u0E00-\u0E7F]/.test(title) ? title : `สรุป: ${title}`;
  const translatedSummary = /[\u0E00-\u0E7F]/.test(summary)
    ? summary
    : "สรุปภาษาไทย: ระบบพบข้อมูลภาษาอังกฤษหรือข้อมูลผสม และเก็บต้นฉบับไว้ใน Dashboard แล้ว";

  const translatedBullets = bullets.length > 0
    ? bullets.map((bullet) => (/[\u0E00-\u0E7F]/.test(bullet) ? bullet : `ประเด็นจากต้นฉบับ: ${bullet}`))
    : ["ยังไม่มี bullet ที่สรุปได้จากข้อมูลนี้"];

  return {
    originalLanguage,
    originalContent,
    translatedTitle,
    translatedSummary,
    translatedBullets,
    originalSource: input.source,
    translatedAt: new Date().toISOString(),
    mode: originalLanguage === "th" ? "normalized" : "fallback",
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
  throw new Error("OpenAI translation response did not contain output text");
}

function normalizeTranslatedJson(value: unknown, input: TranslationInput, originalLanguage: ContentLanguage, originalContent: string): TranslatedResult {
  const object = value as Partial<TranslatedResult>;
  const fallback = normalizeThaiFallback(input, originalLanguage, originalContent);

  return {
    originalLanguage,
    originalContent,
    translatedTitle: typeof object.translatedTitle === "string" && object.translatedTitle ? object.translatedTitle : fallback.translatedTitle,
    translatedSummary: typeof object.translatedSummary === "string" && object.translatedSummary ? object.translatedSummary : fallback.translatedSummary,
    translatedBullets: Array.isArray(object.translatedBullets) && object.translatedBullets.length > 0
      ? object.translatedBullets.filter((item): item is string => typeof item === "string").slice(0, 8)
      : fallback.translatedBullets,
    originalSource: input.source,
    translatedAt: new Date().toISOString(),
    mode: "ai",
  };
}

export function detectLanguage(text: string): ContentLanguage {
  const thaiChars = (text.match(/[\u0E00-\u0E7F]/g) ?? []).length;
  const latinChars = (text.match(/[A-Za-z]/g) ?? []).length;

  if (thaiChars === 0 && latinChars === 0) return "unknown";
  if (thaiChars > 0 && latinChars > 0) return "mixed";
  if (thaiChars > 0) return "th";
  if (latinChars > 0) return "en";
  return "unknown";
}

export async function translateToThai(input: TranslationInput): Promise<TranslatedResult> {
  const originalContent = buildOriginalContent(input);
  const originalLanguage = detectLanguage(originalContent);

  if (originalLanguage === "th" || process.env.AI_TRANSLATION_ENABLED === "false") {
    return normalizeThaiFallback(input, originalLanguage, originalContent);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const enabled = process.env.ENABLE_OPENAI === "true" || process.env.AI_TRANSLATION_ENABLED === "true";
  if (!enabled || !apiKey) return normalizeThaiFallback(input, originalLanguage, originalContent);

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
        input: `Translate and summarize this DailyHub task result into Thai. Return JSON only with translatedTitle, translatedSummary, translatedBullets. Do not add facts that are not in the source.\n\n${originalContent}`,
        text: { format: { type: "json_object" } },
      }),
    });

    if (!response.ok) throw new Error(`Translation API failed: ${response.status}`);
    const json = await response.json();
    const outputText = parseOpenAiOutput(json);
    return normalizeTranslatedJson(JSON.parse(outputText), input, originalLanguage, originalContent);
  } catch {
    return normalizeThaiFallback(input, originalLanguage, originalContent);
  }
}

export async function normalizeBilingualContent(input: TranslationInput): Promise<TranslatedResult> {
  return translateToThai(input);
}

export function formatDashboardResult(result: TranslatedResult): DashboardTranslatedResult {
  return {
    title: result.translatedTitle,
    summary: result.translatedSummary,
    bullets: result.translatedBullets,
    source: result.originalSource,
    language: result.originalLanguage,
    translatedAt: result.translatedAt,
  };
}

export function formatTelegramThaiMessage(input: {
  taskName?: string;
  taskType?: string;
  priorityScore?: number;
  status?: string;
  translation: TranslatedResult;
}) {
  const { taskName, taskType, priorityScore, status, translation } = input;
  const bullets = translation.translatedBullets.length > 0
    ? translation.translatedBullets.map((item) => `- ${item}`).join("\n")
    : "- ไม่มีรายละเอียดเพิ่มเติม";

  const message = `🧠 DailyHub AI\nหัวข้อ: ${translation.translatedTitle}\n\nสรุปภาษาไทย:\n${bullets}\n\nรายละเอียดสำคัญ:\n${translation.translatedSummary}\n\nแหล่งที่มา:\n${translation.originalSource || taskName || "DailyHub"}\n\nภาษาเดิม: ${translation.originalLanguage}\nTask: ${taskName || "-"}${taskType ? ` (${taskType})` : ""}\nPriority: ${priorityScore ?? "-"}/100\nStatus: ${status || "-"}\nเวลาอัปเดต: ${translation.translatedAt}`;

  return message.length > MAX_TELEGRAM_LENGTH ? `${message.slice(0, MAX_TELEGRAM_LENGTH - 80)}\n...\nเปิด Dashboard เพื่อดูต้นฉบับเต็ม` : message;
}

export function toTranslatedGptOutput(gptOutput: GptOutput, translation: TranslatedResult): GptOutput {
  return {
    ...gptOutput,
    title: translation.translatedTitle,
    summary: translation.translatedSummary,
    recommended_action: translation.translatedBullets.join("\n") || gptOutput.recommended_action,
  };
}

export function buildTranslationInputFromTask(task: ScheduledTask, rawInput: Record<string, unknown>, gptOutput: GptOutput): TranslationInput {
  return {
    title: gptOutput.title || task.name,
    source: task.dataSources.join(", ") || task.type,
    content: `${gptOutput.summary}\n\n${gptOutput.recommended_action}`,
    rawInput,
    gptOutput,
  };
}
