"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date().toISOString());
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            ☰
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300">Nimbus Daily</p>
            <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-2xl">API-connected Dashboard</h1>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-400">
            {now ? formatDateTime(now) : "-"}
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            API Live
          </div>
        </div>
      </div>
    </header>
  );
}
