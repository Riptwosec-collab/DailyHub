import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface ErrorLogCardProps {
  error?: string | null;
  compact?: boolean;
}

export function ErrorLogCard({ error, compact = false }: ErrorLogCardProps) {
  return (
    <Card className={error ? "border-rose-400/30 p-5" : "border-emerald-400/20 p-5"}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white">Error Log</p>
          <p className="mt-1 text-xs text-slate-500">
            {error ? "พบ error จากการรัน task รอบนี้" : "ไม่มี error ใน task run นี้"}
          </p>
        </div>
        <Badge tone={error ? "red" : "green"}>{error ? "Error" : "Clean"}</Badge>
      </div>

      <pre
        className={[
          "mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/65 p-4 text-xs leading-6 text-slate-300",
          compact ? "max-h-32" : "max-h-72",
        ].join(" ")}
      >
        {error ?? "No error"}
      </pre>
    </Card>
  );
}
