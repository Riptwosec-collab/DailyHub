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

function hasConfiguredSecret(value?: string) {
  return Boolean(value && value.length >= 16 && !value.includes("change-this"));
}

function hasAnyEnv(names: string[]) {
  return names.some((name) => Boolean(process.env[name]));
}

export function validateProductionEnv() {
  const issues: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    return { ok: true, issues };
  }

  if (process.env.USE_SUPABASE !== "true") issues.push("USE_SUPABASE must be true in production.");
  if (process.env.ALLOW_MOCK_USER === "true") issues.push("ALLOW_MOCK_USER must be false or unset in production.");
  if (!hasConfiguredSecret(process.env.CRON_SECRET || process.env.SCHEDULER_SECRET)) issues.push("Set a strong CRON_SECRET or SCHEDULER_SECRET.");
  if (!hasConfiguredSecret(process.env.ADMIN_SECRET) && !hasAnyEnv(["ADMIN_EMAILS", "ADMIN_EMAIL", "ADMIN_USER_IDS"])) {
    issues.push("Set ADMIN_SECRET or at least one admin allowlist env.");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) issues.push("NEXT_PUBLIC_SUPABASE_URL is required.");
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) issues.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required.");
  if (!hasAnyEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"])) issues.push("SUPABASE service role key is required for backend repositories.");

  if (process.env.ENABLE_OPENAI === "true" && !process.env.OPENAI_API_KEY) issues.push("OPENAI_API_KEY is required when ENABLE_OPENAI=true.");
  if (process.env.ENABLE_GROQ === "true" && !process.env.GROQ_API_KEY) issues.push("GROQ_API_KEY is required when ENABLE_GROQ=true.");
  if (process.env.ENABLE_TELEGRAM === "true" && (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID)) {
    issues.push("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required when ENABLE_TELEGRAM=true.");
  }

  return { ok: issues.length === 0, issues };
}
