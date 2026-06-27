import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  requestId?: string | null;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
  requestId,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="app-surface rounded-xl border-rose-300/20 bg-rose-300/[0.065] p-8 text-center sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-300/25 bg-rose-300/10 text-xl text-rose-100">
        !
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-300">{description}</p>
      {requestId && <p className="mt-3 text-xs text-slate-500">Request ID: {requestId}</p>}
      {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry} type="button">
          Retry
        </Button>
      )}
    </div>
  );
}
