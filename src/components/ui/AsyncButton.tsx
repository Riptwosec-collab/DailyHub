"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./Button";

interface AsyncButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onClick: () => Promise<void> | void;
  loadingText?: string;
  variant?: "primary" | "secondary";
}

export function AsyncButton({ children, onClick, loadingText = "Loading...", disabled, ...props }: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();

  async function handleClick() {
    try {
      setIsLoading(true);
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button disabled={disabled || isLoading} onClick={handleClick} type="button" {...props}>
      {isLoading ? (loadingText === "Loading..." && lang === "th" ? "กำลังโหลด..." : loadingText) : children}
    </Button>
  );
}
