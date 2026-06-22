import { DataLibraryView } from "@/components/data-library/DataLibraryView";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function DataLibraryPage({ searchParams }: { searchParams?: { run?: string } }) {
  return (
    <AppShell>
      <DataLibraryView initialRunId={searchParams?.run ?? ""} />
    </AppShell>
  );
}

