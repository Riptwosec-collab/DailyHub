export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getStoredLang() {
  if (typeof window === "undefined") return "th";
  try {
    const saved = window.localStorage.getItem("nimbus_lang");
    return saved === "en" ? "en" : "th";
  } catch {
    return "th";
  }
}

export function formatDateTime(value: string | null | undefined, lang?: "th" | "en") {
  if (!value) return "-";

  const activeLang = lang ?? getStoredLang();

  return new Intl.DateTimeFormat(activeLang === "en" ? "en-US" : "th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function clampScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}
