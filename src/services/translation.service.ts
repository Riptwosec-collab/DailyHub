import type { ScheduledTask } from "@/types/scheduled-task";
import type { GptOutput } from "@/types/task-run";
import type { ContentLanguage, DashboardTranslatedResult, TranslatedResult, TranslationInput } from "@/types/translation";

const MAX_ORIGINAL_LENGTH = 12000;
const MAX_TELEGRAM_LENGTH = 3600;
const MAX_RAW_BRIEF_ITEMS = 5;

type TranslationProvider = "groq" | "openai" | "mock";

type TranslationConfig = {
  provider: TranslationProvider;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  model: string;
};

function resolveTranslationConfig(): TranslationConfig {
  const preferredProvider = process.env.AI_PROVIDER?.toLowerCase();
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const useGroq = preferredProvider === "groq" || (!preferredProvider && Boolean(groqKey));

  if (useGroq) {
    return {
      provider: groqKey ? "groq" : "mock",
      enabled: process.env.AI_TRANSLATION_ENABLED === "true" || process.env.ENABLE_GROQ === "true" || process.env.ENABLE_AI === "true",
      apiKey: groqKey,
      baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.GROQ_TRANSLATION_MODEL || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }

  return {
    provider: openAiKey ? "openai" : "mock",
    enabled: process.env.AI_TRANSLATION_ENABLED === "true" || process.env.ENABLE_OPENAI === "true" || process.env.ENABLE_AI === "true",
    apiKey: openAiKey,
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || "gpt-5.5",
  };
}

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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function compactItem(item: unknown) {
  const record = asRecord(item);
  if (!record) return truncateText(String(item ?? ""), 220);

  const source = asRecord(record.source);
  const sourceName = asString(source?.name) || asString(record.source) || asString(record.name);
  const title = asString(record.title);
  const description = asString(record.description);
  const content = asString(record.content);
  const url = asString(record.url);

  if (title || description || content) {
    return [
      title ? `หัวข้อ: ${title}` : "",
      sourceName ? `แหล่งข่าว: ${sourceName}` : "",
      description ? `รายละเอียด: ${description}` : "",
      !description && content ? `เนื้อหา: ${content}` : "",
      url ? `URL: ${url}` : "",
    ].filter(Boolean).join(" | ");
  }

  const location = asString(record.location);
  const forecast = asRecord(record.forecast);
  const current = asRecord(forecast?.current);
  if (location || current) {
    return [
      location ? `พื้นที่: ${location}` : "",
      current?.temperature_2m !== undefined ? `อุณหภูมิ: ${current.temperature_2m}°C` : "",
      current?.rain !== undefined ? `ฝน: ${current.rain} mm` : "",
      current?.precipitation !== undefined ? `ปริมาณฝน: ${current.precipitation} mm` : "",
      current?.time ? `เวลา: ${current.time}` : "",
    ].filter(Boolean).join(" | ");
  }

  return truncateText(safeStringify(record), 220);
}

function buildRawInputBrief(rawInput: Record<string, unknown>) {
  const sources = Array.isArray(rawInput.sources) ? rawInput.sources : [];
  if (sources.length === 0) return truncateText(safeStringify(rawInput), 2500);

  const lines = sources.flatMap((sourceEntry, sourceIndex) => {
    const sourceRecord = asRecord(sourceEntry);
    if (!sourceRecord) return [];

    const sourceName = asString(sourceRecord.source) || asString(sourceRecord.title) || `Source ${sourceIndex + 1}`;
    const status = asString(sourceRecord.status);
    const data = sourceRecord.data;
    const items = Array.isArray(sourceRecord.items)
      ? sourceRecord.items
      : Array.isArray(data)
        ? data
        : data !== undefined
          ? [data]
          : [];

    return [
      `Source: ${sourceName}${status ? ` (${status})` : ""}`,
      ...items.slice(0, MAX_RAW_BRIEF_ITEMS).map((item, itemIndex) => `${itemIndex + 1}. ${compactItem(item)}`),
    ];
  });

  return truncateText(lines.join("\n"), 6000);
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
  const rawInputBrief = input.rawInput ? buildRawInputBrief(input.rawInput) : "";
  const parts = [
    input.title ? `Title: ${input.title}` : "",
    input.source ? `Source: ${input.source}` : "",
    input.gptOutput?.summary ? `AI Summary: ${input.gptOutput.summary}` : "",
    input.gptOutput?.recommended_action ? `Recommended Action: ${input.gptOutput.recommended_action}` : "",
    input.content ? `Content: ${input.content}` : "",
    rawInputBrief ? `Source Brief:\n${rawInputBrief}` : "",
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
  throw new Error("Translation response did not contain chat completion text");
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

  const config = resolveTranslationConfig();
  if (!config.enabled || !config.apiKey || !config.baseUrl) {
    console.warn("[DailyHub Translation] AI translation is disabled or missing API config", {
      provider: config.provider,
      enabled: config.enabled,
      hasApiKey: Boolean(config.apiKey),
      hasBaseUrl: Boolean(config.baseUrl),
      model: config.model,
    });
    return normalizeThaiFallback(input, originalLanguage, originalContent);
  }

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
            content: "คุณคือระบบแปลและสรุปของ DailyHub AI ตอบกลับเป็น JSON เท่านั้น ห้ามใช้ markdown และห้ามแต่งข้อเท็จจริงเพิ่ม",
          },
          {
            role: "user",
            content: `แปลและสรุปผลลัพธ์ Scheduled Task ต่อไปนี้เป็นภาษาไทยให้อ่านง่าย\n\nกติกา:\n- ถ้าต้นฉบับเป็นอังกฤษ ให้แปลไทย\n- ถ้าปนไทย/อังกฤษ ให้สรุปไทยก่อน\n- เก็บใจความสำคัญจากต้นฉบับเท่านั้น\n- Return JSON only with keys: translatedTitle, translatedSummary, translatedBullets\n\nOriginal content:\n${originalContent}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${config.provider} translation API failed ${response.status}: ${errorText.slice(0, 500)}`);
    }

    const json = await response.json();
    const outputText = parseChatCompletionOutput(json);
    return normalizeTranslatedJson(JSON.parse(extractJsonObject(outputText)), input, originalLanguage, originalContent);
  } catch (error) {
    console.error("[DailyHub Translation] AI translation failed; using Thai fallback", {
      provider: config.provider,
      model: config.model,
      error: error instanceof Error ? error.message : String(error),
    });
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