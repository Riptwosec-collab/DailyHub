"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function RunNowButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRunNow() {
    setLoading(true);
    try {
      await fetch(`/api/scheduled-tasks/${taskId}/run-now`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleRunNow} disabled={loading} variant="secondary">
      {loading ? "Running..." : "Run Now"}
    </Button>
  );
}
