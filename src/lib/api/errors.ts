export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "OPENAI_REQUEST_FAILED"
  | "TELEGRAM_REQUEST_FAILED"
  | "TASK_RUN_FAILED"
  | "INTERNAL_ERROR";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown> | string[] | null;
  requestId?: string;
}

export class AppError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: Record<string, unknown> | string[] | null;
  expose: boolean;

  constructor({
    message,
    status = 500,
    code = "INTERNAL_ERROR",
    details = null,
    expose = status < 500,
  }: {
    message: string;
    status?: number;
    code?: ApiErrorCode;
    details?: Record<string, unknown> | string[] | null;
    expose?: boolean;
  }) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = expose;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

export function normalizeApiError(error: unknown): AppError {
  if (isAppError(error)) return error;

  return new AppError({
    message: "Something went wrong. Please try again.",
    status: 500,
    code: "INTERNAL_ERROR",
    details: {
      internalMessage: getErrorMessage(error),
    },
    expose: false,
  });
}
