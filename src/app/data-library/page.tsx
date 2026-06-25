import { DataLibraryView } from "@/components/data-library/DataLibraryView";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

type DataLibrarySearchParams = {
  run?: string;
  article?: string;
};

export default function DataLibraryPage({ searchParams }: { searchParams?: DataLibrarySearchParams }) {
  return (
    <AppShell>
      <DataLibraryView initialRunId={searchParams?.run ?? ""} initialArticleId={searchParams?.article ?? ""} />
    </AppShell>
  );
}
