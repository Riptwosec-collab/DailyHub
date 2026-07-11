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

/** Returns true for dates that are still active today, including multi-day events. */
export function isScheduledItemActive(dateLabel: string, now = new Date()) {
  const year = Number(dateLabel.match(/\b(20\d{2})\b/)?.[1]);
  if (!year || /\bTBA\b|\bTBD\b/i.test(dateLabel)) return true;

  const matches = Array.from(dateLabel.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/gi));
  if (matches.length === 0) return true;

  const finalDay = Math.max(
    ...matches.map((match) => {
      const month = monthNumbers[match[1].slice(0, 3).toLowerCase()];
      return Date.UTC(year, month, Number(match[2]));
    }),
  );

  const rangedEndDay = dateLabel.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*-\s*(\d{1,2})/i)?.[1];
  const firstMonth = matches[0]?.[1]?.slice(0, 3).toLowerCase();
  const finalEventDay = rangedEndDay && firstMonth ? Math.max(finalDay, Date.UTC(year, monthNumbers[firstMonth], Number(rangedEndDay))) : finalDay;

  return finalEventDay >= getBangkokDay(now);
}
