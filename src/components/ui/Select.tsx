import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 text-sm font-medium text-white outline-none transition hover:border-white/15 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
