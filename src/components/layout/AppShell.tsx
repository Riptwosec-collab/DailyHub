"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-root min-h-screen overflow-hidden text-slate-100">
          <div className="app-backdrop pointer-events-none fixed inset-0 -z-10">
            <div className="app-backdrop-glow absolute inset-0" />
            <div className="app-backdrop-grid absolute inset-0" />
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
              <div className="mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 lg:px-7 lg:py-6 2xl:px-9">{children}</div>
            </main>
          </div>
    </div>
  );
}
