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
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(
    "nimbus-button-3d inline-flex min-h-10 items-center justify-center gap-2 rounded-lg font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45",
    size === "sm" && "px-3.5 py-2 text-xs",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-6 py-3 text-base",
    variant === "primary" &&
      "border border-cyan-300/40 bg-sky-600 text-white shadow-[0_0_18px_rgba(14,165,233,0.16)] hover:border-cyan-200/60 hover:bg-sky-500",
    variant === "secondary" && "border border-white/10 bg-slate-800/80 text-white hover:border-cyan-300/25 hover:bg-slate-700/80",
    variant === "danger" && "border border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15",
    variant === "ghost" && "border border-transparent bg-transparent text-slate-300 hover:bg-white/[0.07] hover:text-white",
    variant === "outline" && "border border-white/15 bg-slate-950/20 text-slate-100 hover:border-cyan-200/25 hover:bg-white/[0.07]",
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
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
