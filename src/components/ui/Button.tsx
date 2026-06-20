import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95",
        variant === "secondary" && "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]",
        variant === "danger" && "border border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15",
        className,
      )}
      {...props}
    />
  );
}
