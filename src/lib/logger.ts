type LogLevel = "debug" | "info" | "warn" | "error";

const SECRET_KEYS = ["token", "api_key", "apikey", "authorization", "password", "secret", "bot_token"];

function shouldRedactKey(key: string) {
  const lower = key.toLowerCase();
  return SECRET_KEYS.some((secretKey) => lower.includes(secretKey));
}

export function redactSecrets<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item)) as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = shouldRedactKey(key) ? "[REDACTED]" : redactSecrets(item);
    }

    return result as T;
  }

  return value;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    meta: meta ? redactSecrets(meta) : undefined,
  };

  const line = JSON.stringify(payload);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const serverLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") write("debug", message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
