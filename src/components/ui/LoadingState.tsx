import { Card } from "@/components/ui/Card";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading Nimbus Daily data...",
  description = "กำลังดึงข้อมูลจาก API routes",
}: LoadingStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
      <h2 className="mt-5 text-xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </Card>
  );
}
