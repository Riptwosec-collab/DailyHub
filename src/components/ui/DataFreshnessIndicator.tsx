import { formatBangkokDateTime } from "@/lib/data-freshness";
import { cn } from "@/lib/utils";
import type { DataFreshnessStatus } from "@/types/data-freshness";

export interface DataFreshnessIndicatorProps {
  readonly updatedAt?: string;
  readonly status: DataFreshnessStatus;
  readonly sourceNames?: readonly string[];
  readonly label?: string;
  readonly lang?: "th" | "en";
}

const statusCopy = {
  th: { live: "Live", fresh: "ใหม่", delayed: "ล่าช้า", stale: "เก่า", unavailable: "ไม่พร้อม" },
  en: { live: "Live", fresh: "Fresh", delayed: "Delayed", stale: "Stale", unavailable: "Unavailable" },
} as const;

const statusClass: Record<DataFreshnessStatus, string> = {
  live: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  fresh: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  delayed: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  stale: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  unavailable: "border-white/10 bg-white/[0.04] text-slate-400",
};

export function DataFreshnessIndicator({ updatedAt, status, sourceNames = [], label, lang = "th" }: DataFreshnessIndicatorProps) {
  const availableTime = updatedAt && Number.isFinite(new Date(updatedAt).getTime()) ? updatedAt : undefined;
  const sourceText = sourceNames.filter(Boolean).join(", ");
  const timeText = availableTime ? formatBangkokDateTime(availableTime, lang) : statusCopy[lang].unavailable;
  const tooltip = [label, timeText, "Asia/Bangkok", sourceText].filter(Boolean).join(" | ");

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs" title={tooltip}>
      <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-extrabold", statusClass[status])}>
        <span aria-hidden="true">●</span>
        {statusCopy[lang][status]}
      </span>
      <span className="min-w-0 text-slate-400">
        {label ? `${label} ` : ""}
        {availableTime ? <time dateTime={availableTime}>{timeText}</time> : timeText}
        <span className="ml-1 text-slate-500">ICT</span>
      </span>
      {sourceText ? <span className="max-w-full truncate text-slate-500">{sourceText}</span> : null}
    </div>
  );
}
