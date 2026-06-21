export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Nimbus Daily",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appTimezone: process.env.APP_TIMEZONE ?? "Asia/Bangkok",
  useMockData: process.env.USE_MOCK_DATA !== "false",
  enableScheduler: process.env.ENABLE_SCHEDULER !== "false",
  enableOpenAI: process.env.ENABLE_OPENAI === "true",
  enableTelegram: process.env.ENABLE_TELEGRAM === "true",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
  schedulerSecret: process.env.SCHEDULER_SECRET ?? "change-this-secret",
};
