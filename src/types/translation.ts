export type ContentLanguage = "th" | "en" | "mixed" | "unknown";

export type TranslationMode = "ai" | "normalized" | "fallback";

export interface TranslatedResult {
  originalLanguage: ContentLanguage;
  originalContent: string;
  translatedTitle: string;
  translatedSummary: string;
  translatedBullets: string[];
  originalSource?: string;
  translatedAt: string;
  mode?: TranslationMode;
}

export interface TranslationInput {
  title?: string;
  source?: string;
  content?: string;
  rawInput?: Record<string, unknown>;
  gptOutput?: {
    title?: string;
    summary?: string;
    recommended_action?: string;
  };
}

export interface DashboardTranslatedResult {
  title: string;
  summary: string;
  bullets: string[];
  source?: string;
  language: ContentLanguage;
  translatedAt: string;
}
