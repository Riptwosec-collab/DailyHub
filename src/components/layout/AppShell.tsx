"use client";

import { useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="min-h-screen overflow-hidden bg-[#050816] text-slate-100">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.10),transparent_32%),linear-gradient(225deg,rgba(139,92,246,0.10),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(2,6,23,0.94))]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          <div className="flex min-h-screen">
            <Sidebar />

            {isSidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <button
                  aria-label="Close navigation menu"
                  className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                  type="button"
                />
                <div className="relative h-full w-[min(20rem,86vw)]">
                  <Sidebar mobile onNavigate={() => setIsSidebarOpen(false)} />
                </div>
              </div>
            )}

            <main className="min-w-0 flex-1 lg:pl-72">
              <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
              <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </LanguageProvider>
  );
}
