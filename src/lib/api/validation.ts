import { badRequest, validationError } from "./response";

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw badRequest("Invalid JSON body");
  }
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function asBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return fallback;
}

export function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function asStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function requireString(value: unknown, field: string, min = 1) {
  const text = asString(value);
  if (text.length < min) {
    throw validationError(`${field} must be at least ${min} character(s)`, [field]);
  }
  return text;
}

export function validatePriorityScore(score: unknown) {
  const value = asNumber(score, 0);
  if (value < 0 || value > 100) {
    throw validationError("Priority score must be between 0 and 100", ["priorityScore"]);
  }
  return value;
}

export function validateCreateScheduledTaskBody(body: Record<string, unknown>) {
  const errors: string[] = [];

  const name = asString(body.name);
  if (name.length < 3) errors.push("Task name must be at least 3 characters");

  const dataSources = asStringArray(body.dataSources ?? body.data_sources);
  if (dataSources.length === 0) errors.push("Select at least one data source");

  const gptActions = asStringArray(body.gptActions ?? body.gpt_actions);
  if (gptActions.length === 0) errors.push("Select at least one GPT action");

  const outputChannels = asStringArray(body.outputChannels ?? body.output_channels);
  if (outputChannels.length === 0) errors.push("Select at least one output channel");

  const minPriorityScore = asNumber(body.minPriorityScore ?? body.min_priority_score, 0);
  if (minPriorityScore < 0 || minPriorityScore > 100) {
    errors.push("Min priority score must be between 0 and 100");
  }

  if (errors.length > 0) {
    throw validationError("Scheduled task validation failed", errors);
  }

  return true;
}
