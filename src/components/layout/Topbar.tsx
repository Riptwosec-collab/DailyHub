"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [now, setNow] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    setNow(new Date().toISOString());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 px-4 py-3.5 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-white transition hover:bg-white/[0.10] lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            Menu
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-cyan-300">DailyHub</p>
            <h1 className="truncate text-lg font-extrabold text-white sm:text-2xl">{t("topbar_subtitle")}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageToggle />
          <div className="hidden rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-400 md:block">
            {now ? formatDateTime(now) : "-"}
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            {t("topbar_live")}
          </div>
        </div>
      </div>
    </header>
  );
}
