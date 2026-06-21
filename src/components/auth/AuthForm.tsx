"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
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
        setMessage("สมัครสำเร็จ ถ้า Supabase เปิด email confirmation ให้ไปยืนยันอีเมลก่อน login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-10 text-white">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <Badge tone="purple">Nimbus Daily Auth</Badge>
        <h1 className="mt-5 text-3xl font-black">
          {mode === "login" ? "Login" : "Create account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          ใช้ Supabase Auth เพื่อแยก Scheduled Tasks ของแต่ละ user
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold text-slate-300">Email</label>
            <Input
              className="mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-300">Password</label>
            <Input
              className="mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {message && (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
              {message}
            </div>
          )}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
          </Button>
        </form>

        <div className="mt-5 text-sm text-slate-400">
          {mode === "login" ? (
            <p>
              ยังไม่มีบัญชี? <Link className="font-bold text-cyan-200" href="/register">สมัครสมาชิก</Link>
            </p>
          ) : (
            <p>
              มีบัญชีแล้ว? <Link className="font-bold text-cyan-200" href="/login">เข้าสู่ระบบ</Link>
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}
