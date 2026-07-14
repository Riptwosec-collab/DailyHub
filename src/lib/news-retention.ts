export interface NewsRetentionPolicy {
  readonly maxAgeHours: number;
  readonly archiveEnabled: boolean;
}

export const dailyNewsRetentionPolicy: NewsRetentionPolicy = {
  maxAgeHours: 48,
  archiveEnabled: false,
};

export function parseNewsTimestamp(publishedAt?: string | null, fetchedAt?: string | null) {
  const publishedTime = publishedAt ? new Date(publishedAt).getTime() : Number.NaN;
  if (Number.isFinite(publishedTime)) return { time: publishedTime, kind: "published" as const };

  const fetchedTime = fetchedAt ? new Date(fetchedAt).getTime() : Number.NaN;
  if (Number.isFinite(fetchedTime)) return { time: fetchedTime, kind: "fetched" as const };
  return null;
}

export function isNewsWithinRetention(
  publishedAt: string | null | undefined,
  now: Date,
  maxAgeHours: number,
  fetchedAt?: string | null,
) {
  const timestamp = parseNewsTimestamp(publishedAt, fetchedAt);
  if (!timestamp || !Number.isFinite(now.getTime()) || maxAgeHours <= 0) return false;
  const ageMs = now.getTime() - timestamp.time;
  return ageMs >= 0 && ageMs < maxAgeHours * 60 * 60 * 1000;
}
