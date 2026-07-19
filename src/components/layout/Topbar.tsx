"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { SmartSearch } from "@/components/search/SmartSearch";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t, lang } = useLanguage();

  return (
    <header className="daily-topbar sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur-xl sm:px-5 lg:px-7">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(12rem,0.7fr)_minmax(20rem,1.3fr)_auto]">
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

        <div className="order-3 col-span-2 w-full md:order-none md:col-span-1 md:mx-auto md:max-w-2xl">
          <SmartSearch lang={lang} />
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
