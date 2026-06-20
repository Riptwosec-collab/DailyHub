import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "blue" | "green" | "purple" | "red" | "gray";
}

export function Badge({ children, tone = "blue" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        tone === "blue" && "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        tone === "green" && "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
        tone === "purple" && "border-violet-300/30 bg-violet-300/10 text-violet-100",
        tone === "red" && "border-rose-300/30 bg-rose-300/10 text-rose-100",
        tone === "gray" && "border-slate-300/20 bg-slate-300/10 text-slate-200",
      )}
    >
      {children}
    </span>
  );
}
