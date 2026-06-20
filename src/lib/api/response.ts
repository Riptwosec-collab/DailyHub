import { AppError, type ApiErrorCode, normalizeApiError } from "./errors";
import { serverLogger } from "@/lib/logger";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId: string;
}

export interface ApiFailResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown> | string[] | null;
    requestId: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailResponse;

export function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRequestId(request?: Request) {
  return request?.headers.get("x-request-id") ?? createRequestId();
}

export function ok<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown>; requestId?: string }) {
  const requestId = init?.requestId ?? createRequestId();
  const status = init?.status ?? 200;

  return Response.json(
    {
      success: true,
      data,
      meta: init?.meta,
      requestId,
    } satisfies ApiSuccessResponse<T>,
    { ...init, status },
  );
}

export function fail(error: unknown, requestId = createRequestId()) {
  const appError = normalizeApiError(error);

  if (appError.status >= 500) {
    serverLogger.error("API error", {
      requestId,
      code: appError.code,
      status: appError.status,
      message: appError.message,
      details: appError.details,
    });
  }

  return Response.json(
    {
      success: false,
      error: {
        code: appError.code,
        message: appError.expose ? appError.message : "Something went wrong. Please try again.",
        details: appError.expose ? appError.details : undefined,
        requestId,
      },
    } satisfies ApiFailResponse,
    { status: appError.status },
  );
}

export function badRequest(message: string, details?: Record<string, unknown> | string[] | null) {
  return new AppError({ message, status: 400, code: "BAD_REQUEST", details });
}

export function unauthorized(message = "Please sign in before continuing.") {
  return new AppError({ message, status: 401, code: "UNAUTHORIZED" });
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new AppError({ message, status: 403, code: "FORBIDDEN" });
}

export function notFound(message = "Resource was not found.") {
  return new AppError({ message, status: 404, code: "NOT_FOUND" });
}

export function validationError(message: string, details?: string[] | Record<string, unknown>) {
  return new AppError({ message, status: 422, code: "VALIDATION_ERROR", details });
}

export function rateLimited(message = "Too many requests. Please wait and try again.") {
  return new AppError({ message, status: 429, code: "RATE_LIMITED" });
}
