import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  "Scheduled Tasks",
  "OpenAI GPT Analysis",
  "Telegram Alerts",
  "Supabase Auth/Database",
  "Admin Usage Dashboard",
  "Vercel Cron Ready",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-600 font-black shadow-lg shadow-cyan-500/20">AI</div>
            <div><p className="font-black">DailyHub AI</p><p className="text-xs text-slate-400">Scheduled GPT OS</p></div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.06] sm:block">Login</Link>
            <Link href="/dashboard"><Button>Open App</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div>
          <div className="flex flex-wrap gap-2"><Badge tone="purple">Final MVP</Badge><Badge tone="blue">Next.js + Supabase</Badge><Badge tone="green">OpenAI + Telegram</Badge></div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">สร้าง Scheduled GPT Automation Dashboard ที่รันงาน วิเคราะห์ และแจ้งเตือนเองได้</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">DailyHub AI รวม Dashboard, Scheduled Tasks, GPT Results, Notifications, Admin Usage, Scheduler และ Deploy flow ไว้ในโปรเจกต์เดียว พร้อมต่อ production ต่อได้ทันที</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard"><Button className="w-full sm:w-auto">Open Dashboard</Button></Link><Link href="/scheduled-tasks/create"><Button className="w-full sm:w-auto" variant="secondary">Create Task</Button></Link></div>
        </div>

        <Card className="relative overflow-hidden p-6">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">Production Modules</p>
            <div className="mt-6 grid gap-3">
              {features.map((feature) => <div key={feature} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm font-bold text-slate-200">✓ {feature}</div>)}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
