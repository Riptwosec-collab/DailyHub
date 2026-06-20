import {
  Children,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-2xl font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "px-4 py-2 text-xs",
    size === "md" && "px-5 py-3 text-sm",
    size === "lg" && "px-6 py-4 text-base",
    variant === "primary" &&
      "bg-gradient-to-r from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/20 hover:opacity-95",
    variant === "secondary" && "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]",
    variant === "danger" && "border border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15",
    variant === "ghost" && "border border-transparent bg-transparent text-slate-200 hover:bg-white/[0.08] hover:text-white",
    variant === "outline" && "border border-white/15 bg-transparent text-white hover:bg-white/[0.08]",
    className,
  );

  if (asChild) {
    const child = Children.only(children);

    if (isValidElement<{ className?: string }>(child)) {
      return cloneElement(child as ReactElement<{ className?: string }>, {
        className: cn(classes, child.props.className),
      });
    }
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
