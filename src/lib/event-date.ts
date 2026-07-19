const monthNumbers: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export type ScheduleRetention = "event" | "concert" | "cinema" | "streaming";

const retentionMonths: Record<ScheduleRetention, number> = {
  event: 0,
  concert: 0,
  cinema: 1,
  streaming: 4,
};

function getBangkokDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return Date.UTC(value("year"), value("month") - 1, value("day"));
}

function daysInUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addCalendarMonths(day: number, months: number) {
  const date = new Date(day);
  const targetMonth = date.getUTCMonth() + months;
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const targetDay = Math.min(date.getUTCDate(), daysInUtcMonth(targetYear, normalizedMonth));
  return Date.UTC(targetYear, normalizedMonth, targetDay);
}

function parseFinalScheduledDay(dateLabel: string) {
  const year = Number(dateLabel.match(/\b(20\d{2})\b/)?.[1]);
  if (!year || /\bTBA\b|\bTBD\b/i.test(dateLabel)) return undefined;

  const isoDates = Array.from(dateLabel.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g));
  if (isoDates.length) {
    return Math.max(...isoDates.map((match) => Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
  }

  const matches = Array.from(dateLabel.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/gi));
  if (matches.length === 0) return undefined;

  const explicitDays = matches.map((match) => {
    const month = monthNumbers[match[1].slice(0, 3).toLowerCase()];
    return Date.UTC(year, month, Number(match[2]));
  });

  const sameMonthRangeEnd = dateLabel.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*-\s*(\d{1,2})/i)?.[1];
  if (sameMonthRangeEnd && matches.length === 1) {
    const month = monthNumbers[matches[0][1].slice(0, 3).toLowerCase()];
    explicitDays.push(Date.UTC(year, month, Number(sameMonthRangeEnd)));
  }

  return Math.max(...explicitDays);
}

/** Keeps events through their final day, cinema for one month, and streaming for four months. */
export function isScheduledItemActive(dateLabel: string, now = new Date(), retention: ScheduleRetention = "event") {
  const finalDay = parseFinalScheduledDay(dateLabel);
  if (finalDay === undefined) return true;
  const expiryDay = addCalendarMonths(finalDay, retentionMonths[retention]);
  return expiryDay >= getBangkokDay(now);
}
