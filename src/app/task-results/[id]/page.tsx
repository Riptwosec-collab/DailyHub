import { AppShell } from "@/components/layout/AppShell";
import { TaskRunDetailApiView } from "@/components/results/TaskRunDetailApiView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskRunDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <TaskRunDetailApiView runId={id} />
    </AppShell>
  );
}
