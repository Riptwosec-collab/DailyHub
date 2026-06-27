"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      aria-label={lang === "th" ? "Switch language to English" : "เปลี่ยนภาษาเป็นไทย"}
      className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10"
      onClick={() => setLang(lang === "th" ? "en" : "th")}
      type="button"
    >
      {lang === "th" ? "ไทย" : "English"}
    </button>
  );
}
