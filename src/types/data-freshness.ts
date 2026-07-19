export type DataFreshnessStatus = "live" | "fresh" | "delayed" | "stale" | "unavailable";

export interface DataFreshness {
  sourcePublishedAt?: string;
  sourceUpdatedAt?: string;
  fetchedAt: string;
  processedAt?: string;
  displayedAt?: string;
}

export interface SourceMetadata {
  sourceId: string;
  sourceName: string;
  addedInCurrentUpgrade: boolean;
  fetchedAt: string;
  priority?: number;
}

export interface DataSourceDefinition {
  id: string;
  name: string;
  category: string;
  priority: number;
  enabled: boolean;
  isNew: boolean;
  cacheTtlMs: number;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}
