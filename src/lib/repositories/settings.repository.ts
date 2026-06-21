import { getNimbusDailySettings, normalizeNimbusDailySettings, updateNimbusDailySettings } from "@/lib/settings-store";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NimbusDailySettings, OpenAiMode, SchedulerMode, TelegramMode, UpdateNimbusDailySettingsInput } from "@/types/settings";

type UserSettingsRow = {
  user_id: string;
  open_ai_mode: OpenAiMode;
  telegram_mode: TelegramMode;
  scheduler_mode: SchedulerMode;
  default_timezone: string;
  enable_web_notifications: boolean;
  enable_news_data_source: boolean;
  enable_weather_data_source: boolean;
  enable_email_data_source: boolean;
  min_default_priority_score: number;
  updated_at: string;
};

function useSupabasePersistence() {
  return process.env.USE_SUPABASE === "true";
}

function mapSettingsRow(row: UserSettingsRow): NimbusDailySettings {
  return {
    openAiMode: row.open_ai_mode,
    telegramMode: row.telegram_mode,
    schedulerMode: row.scheduler_mode,
    defaultTimezone: row.default_timezone,
    enableWebNotifications: row.enable_web_notifications,
    enableNewsDataSource: row.enable_news_data_source,
    enableWeatherDataSource: row.enable_weather_data_source,
    enableEmailDataSource: row.enable_email_data_source,
    minDefaultPriorityScore: row.min_default_priority_score,
    updatedAt: row.updated_at,
  };
}

function mapSettingsToRow(userId: string, settings: NimbusDailySettings) {
  return {
    user_id: userId,
    open_ai_mode: settings.openAiMode,
    telegram_mode: settings.telegramMode,
    scheduler_mode: settings.schedulerMode,
    default_timezone: settings.defaultTimezone,
    enable_web_notifications: settings.enableWebNotifications,
    enable_news_data_source: settings.enableNewsDataSource,
    enable_weather_data_source: settings.enableWeatherDataSource,
    enable_email_data_source: settings.enableEmailDataSource,
    min_default_priority_score: settings.minDefaultPriorityScore,
    updated_at: settings.updatedAt,
  };
}

export async function getUserSettings(userId: string): Promise<NimbusDailySettings> {
  if (!useSupabasePersistence()) {
    return getNimbusDailySettings();
  }

  const supabase = createAdminClient();
  if (!supabase) return getNimbusDailySettings();

  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);

  if (data) return mapSettingsRow(data as UserSettingsRow);

  const defaults = getNimbusDailySettings();
  const { error: upsertError } = await supabase.from("user_settings").upsert(mapSettingsToRow(userId, defaults), {
    onConflict: "user_id",
  });

  if (upsertError) throw new Error(upsertError.message);
  return defaults;
}

export async function updateUserSettings(userId: string, input: UpdateNimbusDailySettingsInput): Promise<NimbusDailySettings> {
  if (!useSupabasePersistence()) {
    return updateNimbusDailySettings(input);
  }

  const supabase = createAdminClient();
  if (!supabase) return updateNimbusDailySettings(input);

  const current = await getUserSettings(userId);
  const next = normalizeNimbusDailySettings(input, current);

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(mapSettingsToRow(userId, next), { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapSettingsRow(data as UserSettingsRow);
}
