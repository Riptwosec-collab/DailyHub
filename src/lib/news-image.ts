type NewsImageCandidate = {
  imageUrl?: string;
  relatedSources?: Array<{ url?: string }>;
};

const rejectedImageMarkers = /(placeholder|mock|dummy|fallback|unsplash-source)/i;

export function hasUsableNewsImage(item: NewsImageCandidate) {
  const rawUrl = item.imageUrl?.trim();
  if (!rawUrl || rejectedImageMarkers.test(rawUrl)) return false;

  try {
    const imageUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(imageUrl.protocol)) return false;
    if (item.relatedSources?.some((source) => source.url?.trim() === rawUrl)) return false;

    const isPublisherHomepage = (imageUrl.pathname === '' || imageUrl.pathname === '/')
      && imageUrl.searchParams.size === 0;
    return !isPublisherHomepage;
  } catch {
    return false;
  }
}
