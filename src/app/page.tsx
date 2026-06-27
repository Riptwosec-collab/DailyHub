import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  { label: "Automations", value: "7", hint: "daily workflows ready" },
  { label: "AI summaries", value: "24h", hint: "fresh operational view" },
  { label: "Alerts", value: "Live", hint: "web and Telegram-ready" },
];

const modules = [
  "Scheduled Tasks",
  "GPT Analysis",
  "Telegram Alerts",
  "Data Library",
  "Admin Usage",
  "Production Health",
];

export default function HomePage() {
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
              <p className="text-xs text-slate-400">Scheduled GPT OS</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] sm:block">
              Login
            </Link>
            <Link href="/dashboard">
              <Button>Open App</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
        <div className="flex min-h-[34rem] flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <Badge tone="purple">Production UI</Badge>
            <Badge tone="blue">Next.js + Supabase</Badge>
            <Badge tone="green">AI + Telegram Ready</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            DailyHub
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A refined dark SaaS dashboard for scheduled GPT workflows, data reading, alerts, and production operations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto">Open Dashboard</Button>
            </Link>
            <Link href="/scheduled-tasks/create">
              <Button className="w-full sm:w-auto" variant="secondary">Create Task</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {features.map((item) => (
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
              <p className="text-sm font-bold uppercase text-cyan-200">System Overview</p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">Operations cockpit</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">Clean hierarchy, calm controls, and a dashboard-ready module grid.</p>
            </div>
            <Badge tone="green">Healthy</Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {modules.map((feature) => (
              <div key={feature} className="rounded-xl border border-white/10 bg-slate-950/45 p-4 text-sm font-bold text-slate-200">
                <span className="mr-2 text-cyan-200">✓</span>
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
            <p className="text-sm font-bold text-cyan-100">Today insight</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Your automations are organized into readable cards, scannable tables, and action-focused states for daily operation.
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
