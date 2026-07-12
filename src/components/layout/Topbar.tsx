"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useLanguage();

  return (
    <header className="daily-topbar sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-7">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-white transition hover:border-cyan-300/25 hover:bg-white/[0.10] focus-visible:ring-2 focus-visible:ring-cyan-300/60 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            Menu
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-cyan-300">NimbusDaily</p>
            <h1 className="truncate text-lg font-extrabold text-white sm:text-2xl">{t("topbar_subtitle")}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageToggle />
          <div className="hidden sm:block">
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </header>
  );
}
