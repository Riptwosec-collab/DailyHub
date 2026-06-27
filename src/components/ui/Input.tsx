import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-slate-950/45 px-4 text-sm font-medium text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-slate-500 hover:border-white/15 focus:border-cyan-300/50 focus:bg-slate-950/60 focus:ring-4 focus:ring-cyan-300/10",
        className,
      )}
      {...props}
    />
  );
}
