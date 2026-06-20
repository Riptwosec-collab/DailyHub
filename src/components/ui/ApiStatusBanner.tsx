import { Badge } from "./Badge";

interface ApiStatusBannerProps {
  message: string;
  requestId?: string | null;
  tone?: "info" | "error" | "success" | "warning";
}

const toneClass = {
  info: "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100",
  error: "border-rose-300/20 bg-rose-300/[0.08] text-rose-100",
  success: "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100",
  warning: "border-amber-300/20 bg-amber-300/[0.08] text-amber-100",
};

export function ApiStatusBanner({ message, requestId, tone = "info" }: ApiStatusBannerProps) {
  return (
    <div className={`rounded-3xl border p-4 text-sm ${toneClass[tone]}`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p>{message}</p>
        {requestId && <Badge tone="gray">Request ID: {requestId}</Badge>}
      </div>
    </div>
  );
}
