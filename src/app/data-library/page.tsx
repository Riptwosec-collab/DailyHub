import { DataLibraryView } from "@/components/data-library/DataLibraryView";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

type DataLibrarySearchParams = {
  run?: string;
  article?: string;
};

export default async function DataLibraryPage({ searchParams }: { searchParams?: Promise<DataLibrarySearchParams> }) {
  const params = await searchParams;

  return (
    <AppShell>
      <DataLibraryView initialRunId={params?.run ?? ""} initialArticleId={params?.article ?? ""} />
    </AppShell>
  );
}
