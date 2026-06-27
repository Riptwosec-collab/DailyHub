"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { lang } = useLanguage();
  const text = lang === "th"
    ? { title: "ไม่พบหน้า", desc: "ไม่พบหน้าที่ต้องการ", back: "กลับไปแดชบอร์ด" }
    : { title: "Page not found", desc: "The page you are looking for does not exist.", back: "Back to Dashboard" };

  return (
    <Card className="text-center">
      <p className="text-5xl">?</p>
      <h1 className="mt-4 text-2xl font-bold text-white">{text.title}</h1>
      <p className="mt-2 text-slate-400">{text.desc}</p>
      <Link href="/dashboard" className="mt-5 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950">
        {text.back}
      </Link>
    </Card>
  );
}
