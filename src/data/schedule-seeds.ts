import concertSeedData from "./concerts-2026.seed.json" with { type: "json" };
import eventSeedData from "./events-2026.seed.json" with { type: "json" };

export type ConcertSeed = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  venue: string;
  province: string;
  category: string;
  ticketStatus: string;
  sourceName: string;
  sourceUrl: string;
};

export type EventSeed = {
  id: string;
  title: string;
  titleEnglish?: string;
  aliases: string[];
  shortDescription: string;
  startDate: string;
  endDate: string;
  venue: string;
  hall?: string | null;
  province: string;
  country: string;
  categories: string[];
  audience: string[];
  eventType: "business" | "mixed" | "public";
  admissionType: "registration" | "unknown" | "paid" | "free";
  admissionPrice?: string | null;
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  scheduleStatus: string;
  featured: boolean;
};

export const concertSeeds = concertSeedData as ConcertSeed[];
export const eventSeeds = eventSeedData as EventSeed[];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthIds = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const thaiMonthLabels = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function parseIsoDay(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

export function getSeedMonthId(startDate: string) {
  const parsed = parseIsoDay(startDate);
  if (!parsed) return undefined;
  return `${monthIds[parsed.month]}-${parsed.year}`;
}

export function formatSeedDateRange(startDate: string, endDate: string, locale: "th" | "en") {
  const start = parseIsoDay(startDate);
  const end = parseIsoDay(endDate);
  if (!start || !end) return startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  const labels = locale === "th" ? thaiMonthLabels : monthLabels;
  const displayYear = locale === "th" ? start.year + 543 : start.year;
  const endDisplayYear = locale === "th" ? end.year + 543 : end.year;

  if (startDate === endDate) return locale === "th" ? `${start.day} ${labels[start.month]} ${displayYear}` : `${labels[start.month]} ${start.day}, ${displayYear}`;
  if (start.year === end.year && start.month === end.month) {
    return locale === "th" ? `${start.day}-${end.day} ${labels[start.month]} ${displayYear}` : `${labels[start.month]} ${start.day}-${end.day}, ${displayYear}`;
  }
  return locale === "th"
    ? `${start.day} ${labels[start.month]} ${displayYear} - ${end.day} ${labels[end.month]} ${endDisplayYear}`
    : `${labels[start.month]} ${start.day}-${labels[end.month]} ${end.day}, ${endDisplayYear}`;
}

export function isSafeScheduleSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
