import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-white/10 bg-slate-950/55 px-3.5 text-sm font-medium text-white outline-none transition duration-200 hover:border-white/20 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
