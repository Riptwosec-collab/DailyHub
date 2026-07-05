"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

const navItems = [
  { href: "/", key: "nav_home" },
  { href: "/dashboard", key: "nav_dashboard" },
  { href: "/daily", key: "nav_daily" },
  { href: "/stocks", key: "nav_stocks" },
  { href: "/concerts", key: "nav_concerts" },
  { href: "/movies", key: "nav_movies" },
  { href: "/events", key: "nav_events" },
] satisfies Array<{ href: string; key: TranslationKey }>;

const shortLabels = {
  th: {
    nav_home: "หน้าแรก",
    nav_dashboard: "แดช",
    nav_daily: "ข่าว",
    nav_stocks: "หุ้น",
    nav_concerts: "คอน",
    nav_movies: "หนัง",
    nav_events: "อีเวนต์",
  },
  en: {
    nav_home: "Home",
    nav_dashboard: "Dash",
    nav_daily: "Daily",
    nav_stocks: "Stocks",
    nav_concerts: "Live",
    nav_movies: "Films",
    nav_events: "Events",
  },
} as const;

export function MobileNav() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-7 gap-1 rounded-xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-1.5 py-2 text-center text-[11px] font-extrabold transition active:scale-[0.98]",
              active ? "bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/25" : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            {shortLabels[lang][item.key] ?? t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
