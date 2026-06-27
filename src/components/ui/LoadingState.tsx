import { Card } from "@/components/ui/Card";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading DailyHub data...",
  description = "กำลังดึงข้อมูลจาก API routes",
}: LoadingStateProps) {
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      <h2 className="mt-5 text-xl font-extrabold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-slate-400">{description}</p>
    </Card>
  );
}
