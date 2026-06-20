import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <Card className="text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">ไม่พบหน้าที่ต้องการ</p>
      <Link href="/dashboard" className="mt-5 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950">
        Back to Dashboard
      </Link>
    </Card>
  );
}
