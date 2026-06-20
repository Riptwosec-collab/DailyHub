import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  isMock: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const allowMock = process.env.ALLOW_MOCK_USER !== "false";
  const useSupabase = process.env.USE_SUPABASE === "true";

  if (!useSupabase) {
    return allowMock ? { id: "user_001", email: "mock@dailyhub.local", isMock: true } : null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return allowMock ? { id: "user_001", email: "mock@dailyhub.local", isMock: true } : null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return allowMock ? { id: "user_001", email: "mock@dailyhub.local", isMock: true } : null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isMock: false,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}
