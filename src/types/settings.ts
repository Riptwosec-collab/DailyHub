export type OpenAiMode = "mock" | "real";
export type TelegramMode = "off" | "on";
export type SchedulerMode = "manual" | "daily-cron" | "external";

export interface NimbusDailySettings {
  openAiMode: OpenAiMode;
  telegramMode: TelegramMode;
  schedulerMode: SchedulerMode;
  defaultTimezone: string;
  enableWebNotifications: boolean;
  enableNewsDataSource: boolean;
  enableWeatherDataSource: boolean;
  enableEmailDataSource: boolean;
  minDefaultPriorityScore: number;
  updatedAt: string;
}

export interface UpdateNimbusDailySettingsInput {
  openAiMode?: OpenAiMode;
  telegramMode?: TelegramMode;
  schedulerMode?: SchedulerMode;
  defaultTimezone?: string;
  enableWebNotifications?: boolean;
  enableNewsDataSource?: boolean;
  enableWeatherDataSource?: boolean;
  enableEmailDataSource?: boolean;
  minDefaultPriorityScore?: number;
}
