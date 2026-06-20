"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/scheduled-tasks", label: "Scheduled Tasks", icon: "⏱" },
  { href: "/scheduled-tasks/create", label: "Create Task", icon: "+" },
  { href: "/templates", label: "Templates", icon: "▣" },
  { href: "/task-results", label: "Task Results", icon: "◎" },
  { href: "/notifications", label: "Notifications", icon: "●" },
  { href: "/settings", label: "Settings", icon: "⚙" },
  { href: "/admin", label: "Admin", icon: "◇" },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "border-r border-white/10 bg-slate-950/70 backdrop-blur-2xl",
        mobile ? "h-full w-full p-4" : "fixed left-0 top-0 hidden h-screen w-72 p-5 lg:block",
      )}
    >
      <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 text-lg font-black text-white shadow-[0_0_40px_rgba(34,211,238,0.35)]">
          AI
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-slate-950 bg-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-black tracking-tight text-white">DailyHub AI</p>
          <p className="text-xs text-cyan-100/60">Production MVP</p>
        </div>
      </Link>

      <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.08] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Phase 27</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">Dashboard, API, Scheduler, Templates, Settings, Admin และ Deploy พร้อมใช้งาน</p>
      </div>

      <nav className="mt-7 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                isActive ? "border border-cyan-300/30 bg-white/[0.10] text-white shadow-[0_0_32px_rgba(34,211,238,0.16)]" : "text-slate-400 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl border text-xs transition", isActive ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-400 group-hover:text-white")}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
