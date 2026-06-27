"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <ErrorState
        title={lang === "th" ? "เกิดข้อผิดพลาด" : "Something went wrong"}
        description={error.message || (lang === "th" ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" : "Please try again.")}
        requestId={error.digest ?? null}
        onRetry={reset}
      />
    </main>
  );
}
