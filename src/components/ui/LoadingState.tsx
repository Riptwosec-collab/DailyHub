"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({ title, description }: LoadingStateProps) {
  const { lang } = useLanguage();
  const defaultTitle = lang === "th" ? "กำลังโหลดข้อมูล DailyHub..." : "Loading DailyHub data...";
  const defaultDescription = lang === "th" ? "กำลังดึงข้อมูลจาก API routes" : "Fetching data from API routes";

  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      <h2 className="mt-5 text-xl font-extrabold text-white">{title ?? defaultTitle}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-400">{description ?? defaultDescription}</p>
    </Card>
  );
}
