import type { NimbusDailySettings, SchedulerMode, TelegramMode, OpenAiMode, UpdateNimbusDailySettingsInput } from "@/types/settings";

const openAiModes: OpenAiMode[] = ["mock", "real"];
const telegramModes: TelegramMode[] = ["off", "on"];
const schedulerModes: SchedulerMode[] = ["manual", "daily-cron", "external"];

export const defaultSettings: NimbusDailySettings = {
  openAiMode: process.env.ENABLE_OPENAI === "true" ? "real" : "mock",
  telegramMode: process.env.ENABLE_TELEGRAM === "true" ? "on" : "off",
  schedulerMode: process.env.ENABLE_SCHEDULER === "true" ? "daily-cron" : "manual",
  defaultTimezone: process.env.APP_TIMEZONE ?? "Asia/Bangkok",
  enableWebNotifications: true,
  enableNewsDataSource: process.env.ENABLE_NEWS_SOURCE === "true",
  enableWeatherDataSource: process.env.ENABLE_WEATHER_SOURCE === "true",
  enableEmailDataSource: false,
  minDefaultPriorityScore: 70,
  updatedAt: new Date().toISOString(),
};

declare global {
  // eslint-disable-next-line no-var
  var dailyHubSettings: NimbusDailySettings | undefined;
}

export function getNimbusDailySettings() {
  if (!globalThis.dailyHubSettings) {
    globalThis.dailyHubSettings = { ...defaultSettings, updatedAt: new Date().toISOString() };
  }

  return globalThis.dailyHubSettings;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), 0), 100);
}

export function normalizeNimbusDailySettings(
  input: UpdateNimbusDailySettingsInput,
  current: NimbusDailySettings = getNimbusDailySettings(),
): NimbusDailySettings {
  return {
    openAiMode: openAiModes.includes(input.openAiMode as OpenAiMode) ? (input.openAiMode as OpenAiMode) : current.openAiMode,
    telegramMode: telegramModes.includes(input.telegramMode as TelegramMode) ? (input.telegramMode as TelegramMode) : current.telegramMode,
    schedulerMode: schedulerModes.includes(input.schedulerMode as SchedulerMode) ? (input.schedulerMode as SchedulerMode) : current.schedulerMode,
    defaultTimezone: normalizeString(input.defaultTimezone, current.defaultTimezone),
    enableWebNotifications: normalizeBoolean(input.enableWebNotifications, current.enableWebNotifications),
    enableNewsDataSource: normalizeBoolean(input.enableNewsDataSource, current.enableNewsDataSource),
    enableWeatherDataSource: normalizeBoolean(input.enableWeatherDataSource, current.enableWeatherDataSource),
    enableEmailDataSource: normalizeBoolean(input.enableEmailDataSource, current.enableEmailDataSource),
    minDefaultPriorityScore: normalizeNumber(input.minDefaultPriorityScore, current.minDefaultPriorityScore),
    updatedAt: new Date().toISOString(),
  };
}

export function updateNimbusDailySettings(input: UpdateNimbusDailySettingsInput) {
  const next = normalizeNimbusDailySettings(input, getNimbusDailySettings());
  globalThis.dailyHubSettings = next;
  return next;
}
