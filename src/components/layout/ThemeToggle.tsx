"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isTh = lang === "th";

  return (
    <div className={cn("grid gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-1", compact ? "grid-cols-2" : "grid-cols-2")}>
      {(["dark", "cream"] as const).map((item) => {
        const active = theme === item;
        const label = item === "dark" ? (isTh ? "เข้ม" : "Dark") : (isTh ? "ครีม" : "Cream");
        return (
          <button
            key={item}
            aria-label={item === "dark" ? (isTh ? "เปลี่ยนเป็นธีมเข้ม" : "Switch to dark theme") : (isTh ? "เปลี่ยนเป็นธีมครีม" : "Switch to cream theme")}
            aria-pressed={active}
            className={cn(
              "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-black transition",
              active ? "bg-cyan-300/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)]" : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
            )}
            onClick={() => setTheme(item)}
            type="button"
          >
            <span aria-hidden>{item === "dark" ? "☾" : "☼"}</span>
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
