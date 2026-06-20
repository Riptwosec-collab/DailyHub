"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <ErrorState message={error.message} />;
}
