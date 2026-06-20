"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface Toast extends ToastInput {
  id: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (toast: ToastInput) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      const nextToast: Toast = {
        id,
        title: toast.title,
        description: toast.description,
        tone: toast.tone ?? "info",
      };

      setToasts((current) => [nextToast, ...current].slice(0, 4));
      window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<ToastInput>;
      pushToast(custom.detail);
    }

    window.addEventListener("dailyhub:toast", handler);
    return () => window.removeEventListener("dailyhub:toast", handler);
  }, [pushToast]);

  const value = useMemo(() => ({ pushToast, removeToast }), [pushToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-3xl border bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl",
              toast.tone === "success" && "border-emerald-300/30 shadow-emerald-950/30",
              toast.tone === "error" && "border-rose-300/30 shadow-rose-950/30",
              toast.tone === "warning" && "border-amber-300/30 shadow-amber-950/30",
              toast.tone === "info" && "border-cyan-300/30 shadow-cyan-950/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs leading-5 text-slate-300">{toast.description}</p>}
              </div>
              <button
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      pushToast: (toast: ToastInput) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dailyhub:toast", { detail: toast }));
        }
      },
      removeToast: () => undefined,
    };
  }

  return context;
}

export function showToast(toast: ToastInput) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyhub:toast", { detail: toast }));
  }
}
