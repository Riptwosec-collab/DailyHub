"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const copy = {
  th: {
    tagline: "ระบบปฏิบัติการงาน GPT อัตโนมัติ",
    login: "เข้าสู่ระบบ",
    openApp: "เปิดแอป",
    badges: ["Production UI", "Next.js + Supabase", "พร้อม AI + Telegram"],
    description: "แดชบอร์ด SaaS โหมดมืดสำหรับจัดการงาน GPT อัตโนมัติ อ่านข้อมูล แจ้งเตือน และดูสถานะระบบแบบพร้อมใช้งานจริง",
    openDashboard: "เปิดแดชบอร์ด",
    createTask: "สร้างงาน",
    features: [
      { label: "งานอัตโนมัติ", value: "7", hint: "workflow รายวันพร้อมใช้งาน" },
      { label: "สรุปด้วย AI", value: "24 ชม.", hint: "มุมมองข้อมูลล่าสุด" },
      { label: "แจ้งเตือน", value: "Live", hint: "พร้อมส่งผ่านเว็บและ Telegram" },
    ],
    overview: "ภาพรวมระบบ",
    cockpit: "ศูนย์ควบคุมงาน",
    cockpitDesc: "ลำดับข้อมูลชัด ควบคุมง่าย และจัดโมดูลแบบพร้อมใช้ในแดชบอร์ด",
    healthy: "ปกติ",
    modules: ["งานอัตโนมัติ", "วิเคราะห์ GPT", "แจ้งเตือน Telegram", "คลังข้อมูล", "การใช้งานแอดมิน", "สถานะ Production"],
    insightTitle: "ข้อมูลวันนี้",
    insight: "งานอัตโนมัติถูกจัดเป็นการ์ดที่อ่านง่าย ตารางที่สแกนเร็ว และสถานะที่เน้นการลงมือทำสำหรับงานประจำวัน",
  },
  en: {
    tagline: "Scheduled GPT OS",
    login: "Login",
    openApp: "Open App",
    badges: ["Production UI", "Next.js + Supabase", "AI + Telegram Ready"],
    description: "A refined dark SaaS dashboard for scheduled GPT workflows, data reading, alerts, and production operations.",
    openDashboard: "Open Dashboard",
    createTask: "Create Task",
    features: [
      { label: "Automations", value: "7", hint: "daily workflows ready" },
      { label: "AI summaries", value: "24h", hint: "fresh operational view" },
      { label: "Alerts", value: "Live", hint: "web and Telegram-ready" },
    ],
    overview: "System Overview",
    cockpit: "Operations cockpit",
    cockpitDesc: "Clean hierarchy, calm controls, and a dashboard-ready module grid.",
    healthy: "Healthy",
    modules: ["Scheduled Tasks", "GPT Analysis", "Telegram Alerts", "Data Library", "Admin Usage", "Production Health"],
    insightTitle: "Today insight",
    insight: "Your automations are organized into readable cards, scannable tables, and action-focused states for daily operation.",
  },
} as const;

export default function HomePage() {
  const { lang } = useLanguage();
  const text = copy[lang];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/20 bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 text-sm font-black shadow-lg shadow-cyan-500/20">
              DH
            </div>
            <div>
              <p className="font-extrabold text-white">DailyHub</p>
              <p className="text-xs text-slate-400">{text.tagline}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] sm:block">
              {text.login}
            </Link>
            <Link href="/dashboard">
              <Button>{text.openApp}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
        <div className="flex min-h-[34rem] flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">{text.badges[0]}</Badge>
            <Badge tone="blue">{text.badges[1]}</Badge>
            <Badge tone="green">{text.badges[2]}</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">DailyHub</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{text.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto">{text.openDashboard}</Button>
            </Link>
            <Link href="/scheduled-tasks/create">
              <Button className="w-full sm:w-auto" variant="secondary">{text.createTask}</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {text.features.map((item) => (
              <Card key={item.label} className="p-5">
                <p className="text-sm font-semibold text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-cyan-200">{text.overview}</p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">{text.cockpit}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">{text.cockpitDesc}</p>
            </div>
            <Badge tone="green">{text.healthy}</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {text.modules.map((feature) => (
              <div key={feature} className="rounded-xl border border-white/10 bg-slate-950/45 p-4 text-sm font-bold text-slate-200">
                <span className="mr-2 text-cyan-200">✓</span>
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
            <p className="text-sm font-bold text-cyan-100">{text.insightTitle}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{text.insight}</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
