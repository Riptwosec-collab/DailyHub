import type { ApiResponse } from "@/lib/api/response";

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;

  constructor({
    message,
    code,
    status,
    details,
    requestId,
  }: {
    message: string;
    code: string;
    status: number;
    details?: unknown;
    requestId?: string;
  }) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError({
      message: "API response ไม่ใช่ JSON ที่ถูกต้อง",
      code: "INVALID_JSON_RESPONSE",
      status: response.status,
    });
  }

  if (!payload.success) {
    throw new ApiClientError({
      message: payload.error.message,
      code: payload.error.code,
      status: response.status,
      details: payload.error.details,
      requestId: payload.error.requestId,
    });
  }

  return payload.data;
}

export function getFriendlyApiError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.code === "RATE_LIMITED") return error.message;
    if (error.code === "UNAUTHORIZED") return "กรุณา login ก่อนใช้งาน";
    if (error.code === "VALIDATION_ERROR") return error.message;
    if (error.code === "NOT_FOUND") return "ไม่พบข้อมูลที่ต้องการ";
    return `${error.message}${error.requestId ? ` (Request ID: ${error.requestId})` : ""}`;
  }

  if (error instanceof Error) return error.message;
  return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

// Backward-compatible aliases for older Phase 17 components.
// Some UI files import apiRequest/toErrorMessage while newer hardening code uses apiFetch/getFriendlyApiError.
export const apiRequest = apiFetch;
export const toErrorMessage = getFriendlyApiError;
