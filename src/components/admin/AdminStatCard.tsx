import { Card } from "@/components/ui/Card";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>}
    </Card>
  );
}
