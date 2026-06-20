import { Card } from "@/components/ui/Card";
import type { UsageLimitStatus } from "@/types/usage";

export function UsageLimitCard({ item }: { item: UsageLimitStatus }) {
  const percent = item.limit > 0 ? Math.min(Math.round((item.used / item.limit) * 100), 100) : 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">{item.label}</p>
          <p className="mt-2 text-xs text-slate-500">Reset: {new Date(item.resetAt).toLocaleString()}</p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
          {percent}%
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-3xl font-black text-white">{item.used}</p>
        <p className="text-sm text-slate-400">/ {item.limit}</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-500">Remaining: {item.remaining}</p>
    </Card>
  );
}
