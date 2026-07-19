export type ContentFreshnessStatus = "new" | "active" | "expiring" | "expired";
export type ContentFreshnessKind = "news" | "movie" | "event" | "stock";

type FreshnessInput = {
  kind: ContentFreshnessKind;
  date?: string | null;
  updatedAt?: string | null;
  now?: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function businessDaysBetween(fromTime: number, toTime: number) {
  const start = new Date(fromTime);
  const end = new Date(toTime);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  let days = 0;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function toTime(value?: string | null) {
  if (!value) return null;
  const normalized = value
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(and|และ)\b/gi, "-")
    .replace(/\b(runs|continues)\s+until\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const direct = new Date(normalized).getTime();
  if (Number.isFinite(direct)) return direct;

  const monthDayYear = normalized.match(/^([A-Za-z]{3,9})\s+(\d{1,2})(?:\s*[-–]\s*(?:[A-Za-z]{3,9}\s*)?\d{1,2})?,\s*(\d{4})/);
  if (monthDayYear) {
    const [, month, day, year] = monthDayYear;
    const time = new Date(`${month} ${day}, ${year}`).getTime();
    return Number.isFinite(time) ? time : null;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

export function getContentFreshness(input: FreshnessInput) {
  const now = input.now?.getTime() ?? Date.now();
  const time = toTime(input.date ?? input.updatedAt);

  if (!time) {
    return {
      status: (input.kind === "news" ? "expired" : "active") as ContentFreshnessStatus,
      ageMs: 0,
      isVisible: input.kind !== "news",
    };
  }

  const ageMs = now - time;

  if (input.kind === "news") {
    if (ageMs < 0 || ageMs >= 2 * DAY_MS) return { status: "expired" as const, ageMs, isVisible: false };
    if (ageMs <= 10 * 60 * 60 * 1000) return { status: "new" as const, ageMs, isVisible: true };
    if (ageMs >= 36 * 60 * 60 * 1000) return { status: "expiring" as const, ageMs, isVisible: true };
    return { status: "active" as const, ageMs, isVisible: true };
  }

  if (input.kind === "stock") {
    if (businessDaysBetween(time, now) > 1) return { status: "expired" as const, ageMs, isVisible: true };
    if (ageMs <= 30 * 60 * 1000) return { status: "new" as const, ageMs, isVisible: true };
    return { status: "active" as const, ageMs, isVisible: true };
  }

  if (ageMs > 0) return { status: "expired" as const, ageMs, isVisible: input.kind === "movie" };
  if (Math.abs(ageMs) <= DAY_MS) return { status: "new" as const, ageMs, isVisible: true };
  if (Math.abs(ageMs) <= 7 * DAY_MS) return { status: "expiring" as const, ageMs, isVisible: true };
  return { status: "active" as const, ageMs, isVisible: true };
}

export function getFreshnessLabel(status: ContentFreshnessStatus, lang: "th" | "en") {
  const labels = {
    th: {
      new: "ใหม่",
      active: "ยังใช้ได้",
      expiring: "ใกล้หมดอายุ",
      expired: "หมดอายุ",
    },
    en: {
      new: "New",
      active: "Active",
      expiring: "Expiring",
      expired: "Expired",
    },
  } as const;

  return labels[lang][status];
}

export function getFreshnessClass(status: ContentFreshnessStatus) {
  if (status === "new") return "nimbus-live-new";
  if (status === "expired") return "nimbus-live-stale";
  if (status === "expiring") return "nimbus-live-expiring";
  return "";
}
