import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { forbidden, unauthorized } from "@/lib/api/response";

export interface CurrentUser {
  id: string;
  email: string | null;
  isMock: boolean;
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function allowMockUser() {
  if (process.env.ALLOW_MOCK_USER === "true") return true;
  if (process.env.ALLOW_MOCK_USER === "false") return false;
  if (process.env.USE_SUPABASE !== "true") return true;
  return !isProduction();
}

function parseCsvEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isConfiguredSecret(value?: string | null) {
  return Boolean(value && value.length >= 16 && !value.includes("change-this"));
}

function hasAdminSecret(request: Request) {
  const configured = process.env.ADMIN_SECRET;
  if (!isConfiguredSecret(configured)) return false;

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-admin-secret");
  const candidate = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : headerSecret;
  return Boolean(candidate && candidate === configured);
}

export function isAdminUser(user: CurrentUser) {
  if (!isProduction() && user.isMock) return true;

  const adminIds = new Set(parseCsvEnv("ADMIN_USER_IDS"));
  if (adminIds.has(user.id)) return true;

  if (!user.email) return false;
  const adminEmails = new Set([...parseCsvEnv("ADMIN_EMAILS"), ...parseCsvEnv("ADMIN_EMAIL")].map((email) => email.toLowerCase()));
  return adminEmails.has(user.email.toLowerCase());
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const allowMock = allowMockUser();
  const useSupabase = process.env.USE_SUPABASE === "true";

  if (!useSupabase) {
    return allowMock ? { id: "user_001", email: "mock@nimbusdaily.local", isMock: true } : null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return allowMock ? { id: "user_001", email: "mock@nimbusdaily.local", isMock: true } : null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return allowMock ? { id: "user_001", email: "mock@nimbusdaily.local", isMock: true } : null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isMock: false,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  if (!isAdminUser(user)) throw forbidden("Admin access is required.");
  return user;
}

export async function requireAdminRequest(request: Request) {
  if (hasAdminSecret(request)) {
    return { id: "admin_secret", email: null, isMock: false } satisfies CurrentUser;
  }

  return requireAdminUser();
}
