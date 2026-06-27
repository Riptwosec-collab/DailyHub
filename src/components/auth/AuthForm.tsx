"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "register";
}

const copy = {
  th: {
    loginTitle: "เข้าสู่ระบบ",
    registerTitle: "สร้างบัญชี",
    description: "ใช้ Supabase Auth เพื่อแยก Scheduled Tasks ของผู้ใช้แต่ละคน",
    email: "อีเมล",
    password: "รหัสผ่าน",
    passwordPlaceholder: "อย่างน้อย 6 ตัวอักษร",
    loading: "กำลังโหลด...",
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",
    noAccount: "ยังไม่มีบัญชี?",
    createAccount: "สมัครสมาชิก",
    hasAccount: "มีบัญชีแล้ว?",
    registerSuccess: "สมัครสำเร็จ หากเปิด email confirmation ใน Supabase กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    authFailed: "เข้าสู่ระบบไม่สำเร็จ",
  },
  en: {
    loginTitle: "Login",
    registerTitle: "Create account",
    description: "Use Supabase Auth to separate each user's scheduled tasks.",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    loading: "Loading...",
    login: "Login",
    register: "Register",
    noAccount: "No account yet?",
    createAccount: "Create account",
    hasAccount: "Already have an account?",
    registerSuccess: "Account created. If Supabase email confirmation is enabled, please confirm your email before logging in.",
    authFailed: "Auth failed",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const text = copy[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (mode === "register") {
        setMessage(text.registerSuccess);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.authFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-10 text-white">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="purple">DailyHub Auth</Badge>
          <LanguageToggle />
        </div>
        <h1 className="mt-5 text-3xl font-black">{mode === "login" ? text.loginTitle : text.registerTitle}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{text.description}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold text-slate-300">{text.email}</label>
            <Input className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-300">{text.password}</label>
            <Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={text.passwordPlaceholder} minLength={6} required />
          </div>

          {message && <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">{message}</div>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? text.loading : mode === "login" ? text.login : text.register}
          </Button>
        </form>

        <div className="mt-5 text-sm text-slate-400">
          {mode === "login" ? (
            <p>
              {text.noAccount} <Link className="font-bold text-cyan-200" href="/register">{text.createAccount}</Link>
            </p>
          ) : (
            <p>
              {text.hasAccount} <Link className="font-bold text-cyan-200" href="/login">{text.login}</Link>
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}
