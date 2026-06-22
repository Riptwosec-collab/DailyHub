"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";

const TOPICS = [
  { key: "all", icon: "âœ¨", th: "à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”", en: "All" },
  { key: "Daily Brief", icon: "ðŸ“°", th: "à¸‚à¹ˆà¸²à¸§ / à¸ªà¸£à¸¸à¸›à¸›à¸£à¸°à¸ˆà¸³à¸§à¸±à¸™", en: "News / Daily Brief" },
  { key: "Weather", icon: "ðŸŒ¦ï¸", th: "à¸ªà¸ à¸²à¸žà¸­à¸²à¸à¸²à¸¨", en: "Weather" },
  { key: "Sale Monitor", icon: "ðŸŒ", th: "à¸ªà¸´à¸™à¸„à¹‰à¸²à¹ƒà¸«à¸¡à¹ˆ/à¸™à¹ˆà¸²à¸ªà¸™à¹ƒà¸ˆà¸—à¸±à¹ˆà¸§à¹‚à¸¥à¸", en: "Global Product Radar" },
  { key: "Email Monitor", icon: "ðŸ“§", th: "à¸­à¸µà¹€à¸¡à¸¥à¸ªà¸³à¸„à¸±à¸", en: "Email Monitor" },
  { key: "Concert Alerts", icon: "ðŸŽ¤", th: "à¸„à¸­à¸™à¹€à¸ªà¸´à¸£à¹Œà¸•", en: "Concert Alerts" },
  { key: "World Cup Recap", icon: "âš½", th: "à¸Ÿà¸¸à¸•à¸šà¸­à¸¥", en: "Football" },
  { key: "Weekend Ideas", icon: "ðŸ§­", th: "à¹„à¸­à¹€à¸”à¸µà¸¢à¸§à¸±à¸™à¸«à¸¢à¸¸à¸”", en: "Weekend Ideas" },
  { key: "Weekend Long Read", icon: "ðŸ“š", th: "à¸šà¸—à¸„à¸§à¸²à¸¡à¸­à¹ˆà¸²à¸™à¸¢à¸²à¸§", en: "Long Read" },
  { key: "failed", icon: "âŒ", th: "à¸¡à¸µà¸›à¸±à¸à¸«à¸²", en: "Failed" },
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function asText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function sourceNames(run: TaskRun) {
  const sources = Array.isArray(run.rawInput?.sources) ? run.rawInput.sources : [];
  return sources.map((source) => {
    const record = asRecord(source);
    return asText(record?.source) || asText(record?.title);
  }).filter(Boolean);
}

function countItems(run: TaskRun) {
  const sources = Array.isArray(run.rawInput?.sources) ? run.rawInput.sources : [];
  return sources.reduce((total, source) => {
    const record = asRecord(source);
    if (!record) return total;
    const data = record.data;
    const dataRecord = asRecord(data);
    if (Array.isArray(record.items)) return total + record.items.length;
    if (Array.isArray(data)) return total + data.length;
    if (Array.isArray(dataRecord?.ideas)) return total + dataRecord.ideas.length;
    if (Array.isArray(dataRecord?.articles)) return total + dataRecord.articles.length;
    if (Array.isArray(dataRecord?.items)) return total + dataRecord.items.length;
    return total + (data ? 1 : 0);
  }, 0);
}

function topicFor(task?: ScheduledTask, run?: TaskRun) {
  const text = `${task?.type ?? ""} ${task?.name ?? ""} ${sourceNames(run ?? ({} as TaskRun)).join(" ")}`.toLowerCase();
  if (text.includes("weather")) return "Weather";
  if (text.includes("email") || text.includes("gmail")) return "Email Monitor";
  if (text.includes("concert")) return "Concert Alerts";
  if (text.includes("football") || text.includes("world cup")) return "World Cup Recap";
  if (text.includes("long read")) return "Weekend Long Read";
  if (text.includes("weekend idea")) return "Weekend Ideas";
  if (text.includes("product") || text.includes("sale")) return "Sale Monitor";
  return "Daily Brief";
}

function detailLines(run: TaskRun) {
  const sources = Array.isArray(run.rawInput?.sources) ? run.rawInput.sources : [];
  return sources.flatMap((source) => {
    const record = asRecord(source);
    if (!record) return [];
    const items = Array.isArray(record.items) ? record.items : Array.isArray(record.data) ? record.data : [];
    return items.slice(0, 8).map((item) => {
      const row = asRecord(item);
      if (!row) return String(item);
      return [row.product, row.title, row.match, row.idea, row.subject, row.artist, row.location, row.description, row.content, row.highlight, row.whyInteresting]
        .map(asText)
        .filter(Boolean)
        .slice(0, 3)
        .join(" â€” ");
    }).filter(Boolean);
  });
}

export function DataLibraryView({ initialRunId = "" }: { initialRunId?: string }) {
  const { lang } = useLanguage();
  const isTh = lang === "th";
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [runId, setRunId] = useState(initialRunId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, runData] = await Promise.all([
        apiRequest<ScheduledTask[]>("/api/scheduled-tasks"),
        apiRequest<TaskRun[]>("/api/task-runs"),
      ]);
      setTasks(taskData);
      setRuns(runData);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => setRunId(initialRunId), [initialRunId]);

  const taskMap = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const visibleRuns = useMemo(() => runs.filter((run) => {
    const task = taskMap.get(run.taskId);
    if (runId && run.id !== runId) return false;
    if (filter === "failed" && run.status !== "failed" && !run.telegramStatus?.includes("failed")) return false;
    if (filter !== "all" && filter !== "failed" && topicFor(task, run) !== filter) return false;
    const searchText = `${task?.name ?? ""} ${task?.type ?? ""} ${run.gptOutput.title} ${run.gptOutput.summary} ${run.translatedContent ?? ""} ${JSON.stringify(run.rawInput)}`.toLowerCase();
    return !query || searchText.includes(query.toLowerCase());
  }), [filter, query, runId, runs, taskMap]);

  if (loading) return <LoadingState title={isTh ? "à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”à¸„à¸¥à¸±à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥" : "Loading Data Library"} description={isTh ? "à¸à¸³à¸¥à¸±à¸‡à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸•à¹‡à¸¡à¸ˆà¸²à¸ API" : "Fetching full data from API"} />;
  if (error) return <ErrorState title={isTh ? "à¹‚à¸«à¸¥à¸” Data Library à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ" : "Data Library loading failed"} description={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8">
        <Badge tone="purple">Data Library</Badge>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">{isTh ? "à¸„à¸¥à¸±à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸•à¹‡à¸¡à¸‚à¸­à¸‡ Nimbus Daily" : "Nimbus Daily full data library"}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          {isTh ? "Telegram à¸ªà¹ˆà¸‡à¹à¸„à¹ˆà¸ªà¸£à¸¸à¸›à¸ªà¸±à¹‰à¸™ à¸ªà¹ˆà¸§à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ˆà¸³à¸™à¸§à¸™à¸¡à¸²à¸à¹€à¸à¹‡à¸šà¹„à¸§à¹‰à¸—à¸µà¹ˆà¸«à¸™à¹‰à¸²à¸™à¸µà¹‰ à¹à¸¢à¸à¸«à¸¡à¸§à¸” à¸„à¹‰à¸™à¸«à¸² à¹à¸¥à¸°à¸­à¹ˆà¸²à¸™à¹€à¸•à¹‡à¸¡à¹„à¸”à¹‰" : "Telegram sends a compact summary. Full collected data is stored here by category."}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Card className="p-4"><p className="text-sm text-slate-400">Runs</p><p className="text-3xl font-black text-white">{runs.length}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-400">Visible</p><p className="text-3xl font-black text-white">{visibleRuns.length}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-400">Run</p><p className="truncate text-sm font-bold text-cyan-100">{runId || "-"}</p></Card>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none" onChange={(event) => setQuery(event.target.value)} placeholder={isTh ? "à¸„à¹‰à¸™à¸«à¸²à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸•à¹‡à¸¡..." : "Search full data..."} value={query} />
          {runId && <Button onClick={() => setRunId("")} type="button" variant="secondary">{isTh ? "à¸”à¸¹à¸—à¸¸à¸ run" : "View all runs"}</Button>}
          <Button onClick={load} type="button" variant="outline">ðŸ”„ {isTh ? "à¸£à¸µà¹€à¸Ÿà¸£à¸Š" : "Refresh"}</Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {TOPICS.map((item) => <button key={item.key} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${filter === item.key ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`} onClick={() => setFilter(item.key)} type="button">{item.icon} {isTh ? item.th : item.en}</button>)}
        </div>
      </Card>

      {visibleRuns.length === 0 ? <EmptyState title={isTh ? "à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸•à¹‡à¸¡" : "No full data"} description={isTh ? "à¸¥à¸­à¸‡à¸£à¸±à¸™ task à¸ˆà¸²à¸ Dashboard à¸à¹ˆà¸­à¸™" : "Run tasks from the Dashboard first."} /> : <div className="grid gap-4 xl:grid-cols-2">{visibleRuns.map((run) => {
        const task = taskMap.get(run.taskId);
        const topic = TOPICS.find((item) => item.key === topicFor(task, run)) ?? TOPICS[1];
        const names = sourceNames(run);
        const lines = detailLines(run);
        return <Card key={run.id} className="p-5">
          <div className="flex flex-wrap gap-2"><Badge tone="blue">{topic.icon} {isTh ? topic.th : topic.en}</Badge><Badge tone={run.status === "failed" ? "red" : "green"}>{run.status}</Badge><Badge tone="gray">Telegram: {run.telegramStatus || "unknown"}</Badge></div>
          <h3 className="mt-4 text-xl font-black text-white">{run.translation?.translatedTitle || run.gptOutput.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{run.translatedContent || run.translation?.translatedSummary || run.gptOutput.summary}</p>
          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 sm:grid-cols-2"><p className="text-sm text-slate-300">Task: <b>{task?.name ?? run.taskId}</b></p><p className="text-sm text-slate-300">Priority: <b>{run.priorityScore}/100</b></p><p className="text-sm text-slate-300">Items: <b>{countItems(run)}</b></p><p className="text-sm text-slate-300">{formatDateTime(run.startedAt)}</p></div>
          {names.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{names.map((name) => <Badge key={name} tone="gray">ðŸ—‚ {name}</Badge>)}</div>}
          {lines.length > 0 && <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">{lines.map((line) => <li key={line}>â€¢ {line}</li>)}</ul>}
          <div className="mt-5"><Button asChild size="sm" variant="outline"><Link href={`/task-results/${run.id}`}>ðŸ“‹ {isTh ? "à¹€à¸›à¸´à¸”à¸œà¸¥à¸¥à¸±à¸žà¸˜à¹Œ run" : "Open run"}</Link></Button></div>
        </Card>;
      })}</div>}
    </div>
  );
}

