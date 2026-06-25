"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DATA_LIBRARY_SEED_ITEMS, type LibrarySeedItem, type LibraryTopicKey } from "@/lib/data-library-seeds";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";

type TopicKey = "all" | LibraryTopicKey | "failed";

type LibraryViewItem = {
  id: string;
  topic: LibraryTopicKey;
  icon: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  source: string;
  category: string;
  priority: number;
  readTime: string;
  tags: string[];
  details: string[];
  sections: Array<{ heading: string; body: string }>;
  updatedAt: string;
  status?: string;
  telegramStatus?: string | null;
  runId?: string;
  isSeed?: boolean;
};

const TOPICS: Array<{ key: TopicKey; icon: string; th: string; en: string }> = [
  { key: "all", icon: "✨", th: "ทั้งหมด", en: "All" },
  { key: "daily", icon: "📰", th: "ข่าวโลก", en: "Global News" },
  { key: "product", icon: "🌍", th: "สินค้าเทค/นวัตกรรม", en: "Innovation Products" },
  { key: "market", icon: "📈", th: "US Stock News", en: "US Stock News" },
  { key: "email", icon: "📧", th: "อีเมลรายวัน", en: "Daily Email" },
  { key: "concert", icon: "🎤", th: "คอนเสิร์ตในไทย", en: "Thailand Concerts" },
  { key: "football", icon: "⚽", th: "ฟุตบอล", en: "Football" },
  { key: "longread", icon: "📚", th: "บทความอ่านยาว", en: "Long Read" },
  { key: "failed", icon: "❌", th: "มีปัญหา", en: "Failed" },
];

const TOPIC_PATTERNS: Array<{ topic: LibraryTopicKey; pattern: RegExp }> = [
  { topic: "product", pattern: /product|innovation|radar|gadget|สินค้า|นวัตกรรม|เทค/i },
  { topic: "market", pattern: /stock|market|nasdaq|nyse|nvda|amd|msft|aapl|us stock|ตลาดสหรัฐ|หุ้น/i },
  { topic: "email", pattern: /email|gmail|mail|inbox|อีเมล/i },
  { topic: "concert", pattern: /concert|artist|ticket|venue|คอนเสิร์ต|ศิลปิน|thailand|bangkok/i },
  { topic: "football", pattern: /football|soccer|world cup|premier|laliga|bundesliga|serie|ligue|uefa|บอล|ฟุตบอล/i },
  { topic: "longread", pattern: /long read|article|reading|บทความ|อ่านยาว/i },
  { topic: "daily", pattern: /daily|brief|news|headline|ข่าว|สรุป/i },
];

const LEGACY_INPUT_KEYS = ["news", "weather", "products", "gmail", "football", "concerts", "articles", "market"];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join("\n");
  return "";
}

function compact(text: string, max = 260) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

function topicFromText(text: string): LibraryTopicKey {
  return TOPIC_PATTERNS.find((item) => item.pattern.test(text))?.topic ?? "daily";
}

function articleHref(item: LibraryViewItem) {
  return `/data-library?article=${encodeURIComponent(item.id)}`;
}

function sourceItems(rawInput: Record<string, unknown>) {
  const fromSources = (Array.isArray(rawInput.sources) ? rawInput.sources : []).flatMap((source) => {
    const row = asRecord(source);
    if (!row) return [];
    if (Array.isArray(row.items)) return row.items;
    if (Array.isArray(row.data)) return row.data;
    const data = asRecord(row.data);
    if (Array.isArray(data?.items)) return data.items;
    return row.data ? [row.data] : [];
  });

  const legacyItems = LEGACY_INPUT_KEYS.flatMap((key) => {
    const value = rawInput[key];
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value.map((item) => ({ title: asText(item), category: key, source: key }));
    return [{ title: asText(value) || key, category: key, source: key }];
  });

  return [...fromSources, ...legacyItems];
}

function runToLibraryItem(run: TaskRun, task?: ScheduledTask): LibraryViewItem {
  const rawInput = (asRecord(run.rawInput) ?? {}) as Record<string, unknown>;
  const items = sourceItems(rawInput);
  const first = asRecord(items[0]);
  const text = `${task?.name ?? ""} ${task?.type ?? ""} ${run.gptOutput.title} ${run.gptOutput.summary} ${run.translatedContent ?? ""} ${JSON.stringify(rawInput)}`;
  const topic = topicFromText(text);
  const topicMeta = TOPICS.find((item) => item.key === topic);
  const title = topic === "market" ? "US Stock News" : run.translation?.translatedTitle || run.gptOutput.title || task?.name || "Nimbus Daily Result";
  const summary = run.translatedContent || run.translation?.translatedSummary || run.gptOutput.summary || run.originalContent || "ยังไม่มีสรุป";
  const itemText = items.slice(0, 10).map((item, index) => {
    const row = asRecord(item);
    if (!row) return `${index + 1}. ${asText(item)}`;
    const main = [row.teamNames, row.eventName, row.product, row.symbol, row.company, row.title, row.subject, row.description, row.summary]
      .map(asText)
      .filter(Boolean)
      .slice(0, 3)
      .join(" — ");
    return `${index + 1}. ${main || JSON.stringify(item).slice(0, 160)}`;
  });

  const detailFields = first
    ? [
        ["Source", first.source],
        ["Category", first.category],
        ["Teams", first.teamNames],
        ["Event", first.eventName],
        ["Artist", first.artist],
        ["Venue", first.venue],
        ["Product", first.product],
        ["Market", first.symbol || first.company],
        ["Why", first.whyItMatters || first.whyInteresting],
        ["Action", first.action || first.suggestedAction],
      ].map(([label, value]) => `${label}: ${asText(value)}`).filter((value) => !value.endsWith(": "))
    : [];

  return {
    id: run.id,
    topic,
    icon: topicMeta?.icon ?? "✨",
    titleTh: title,
    titleEn: title,
    summaryTh: summary,
    summaryEn: run.gptOutput.summary || summary,
    source: task?.dataSources?.join(", ") || "Task Run",
    category: task?.type || topicMeta?.en || "Nimbus Daily",
    priority: run.priorityScore,
    readTime: items.length > 4 ? "4-6 นาที" : "2-3 นาที",
    tags: [topicMeta?.en, task?.type, run.status, run.telegramStatus].filter(Boolean) as string[],
    details: [...detailFields, ...itemText].slice(0, 14),
    sections: [
      { heading: "สรุป", body: summary },
      { heading: "ข้อมูลที่พบ", body: itemText.length ? itemText.join("\n") : run.originalContent || run.gptOutput.recommended_action || "ไม่มีข้อมูลดิบใน run นี้" },
      { heading: "ควรทำต่อ", body: run.gptOutput.recommended_action || "เปิดดูรายละเอียดใน Task Results หรือรัน task ใหม่เพื่อเก็บข้อมูลล่าสุด" },
    ],
    updatedAt: run.startedAt,
    status: run.status,
    telegramStatus: run.telegramStatus,
    runId: run.id,
    isSeed: false,
  };
}

function seedToLibraryItem(item: LibrarySeedItem): LibraryViewItem {
  return { ...item, isSeed: true };
}

function statusTone(status?: string) {
  if (status === "success") return "green" as const;
  if (status === "failed") return "red" as const;
  if (status === "running") return "purple" as const;
  return "gray" as const;
}

function telegramTone(status?: string | null) {
  if (status === "sent" || status?.startsWith("mock_sent")) return "green" as const;
  if (status?.includes("failed")) return "red" as const;
  if (status?.includes("skipped")) return "gray" as const;
  return "purple" as const;
}

function Reader({ item, isTh }: { item: LibraryViewItem; isTh: boolean }) {
  return (
    <Card className="border-cyan-300/25 bg-cyan-300/[0.04] p-5 sm:p-7" id="article-reader">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{item.icon} {item.category}</Badge>
            <Badge tone={item.isSeed ? "purple" : statusTone(item.status)}>{item.isSeed ? "Readable" : item.status}</Badge>
            {item.telegramStatus ? <Badge tone={telegramTone(item.telegramStatus)}>📨 {item.telegramStatus}</Badge> : null}
          </div>
          <h2 className="mt-4 text-2xl font-black leading-9 text-white sm:text-4xl">{isTh ? item.titleTh : item.titleEn}</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">{isTh ? item.summaryTh : item.summaryEn}</p>
        </div>
        <Link className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.10]" href="/data-library">
          {isTh ? "กลับหน้ารวม" : "Back"}
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Source</p><p className="mt-1 text-sm font-bold text-white">{item.source}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Priority</p><p className="mt-1 text-2xl font-black text-cyan-100">{item.priority}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Read time</p><p className="mt-1 text-sm font-bold text-white">{item.readTime}</p></div>
      </div>

      <div className="mt-6 grid gap-4">
        {item.sections.map((section, index) => (
          <div key={`${section.heading}-${index}`} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Section {index + 1}</p>
            <h3 className="mt-2 text-lg font-black text-white">{section.heading}</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/50 p-5">
        <h3 className="font-black text-white">{isTh ? "รายละเอียดแยกอ่านง่าย" : "Readable details"}</h3>
        <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
          {item.details.map((detail) => <p key={detail} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">• {detail}</p>)}
        </div>
      </div>
    </Card>
  );
}

export function DataLibraryView({ initialRunId = "", initialArticleId = "" }: { initialRunId?: string; initialArticleId?: string }) {
  const { lang } = useLanguage();
  const isTh = lang === "th";
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TopicKey>("all");
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
  const libraryItems = useMemo(() => [...runs.map((run) => runToLibraryItem(run, taskMap.get(run.taskId))), ...DATA_LIBRARY_SEED_ITEMS.map(seedToLibraryItem)], [runs, taskMap]);
  const selectedItem = useMemo(() => libraryItems.find((item) => item.id === initialArticleId) ?? null, [initialArticleId, libraryItems]);

  const visibleItems = useMemo(() => libraryItems.filter((item) => {
    if (runId && item.runId !== runId) return false;
    if (filter === "failed" && item.status !== "failed" && !item.telegramStatus?.includes("failed")) return false;
    if (filter !== "all" && filter !== "failed" && item.topic !== filter) return false;
    if (!query) return true;
    const search = `${item.titleTh} ${item.titleEn} ${item.summaryTh} ${item.summaryEn} ${item.source} ${item.category} ${item.tags.join(" ")} ${item.details.join(" ")}`.toLowerCase();
    return search.includes(query.toLowerCase());
  }), [filter, libraryItems, query, runId]);

  const groupedItems = useMemo(() => TOPICS.filter((topic) => topic.key !== "all" && topic.key !== "failed").map((topic) => ({ topic, items: visibleItems.filter((item) => item.topic === topic.key) })).filter((group) => group.items.length > 0), [visibleItems]);
  const runItemCount = libraryItems.filter((item) => !item.isSeed).length;
  const seedItemCount = libraryItems.filter((item) => item.isSeed).length;

  if (loading) return <LoadingState title={isTh ? "กำลังโหลดคลังข้อมูล" : "Loading Data Library"} description={isTh ? "กำลังดึงข้อมูลเต็มจาก API และคลังตัวอย่าง" : "Fetching API runs and readable seed content"} />;
  if (error) return <ErrorState title={isTh ? "โหลด Data Library ไม่สำเร็จ" : "Data Library loading failed"} description={error} onRetry={load} />;

  return (
    <div className="nimbus-depth-space space-y-8">
      <Card className="nimbus-pulse-dot relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <Badge tone="purple">🧊 {isTh ? "คลังข้อมูลเต็ม" : "Full Data Library"}</Badge>
          <h1 className="mt-5 max-w-4xl text-3xl font-black text-white sm:text-5xl">{isTh ? "อ่านข้อมูลเต็มแบบแยกเรื่อง" : "Read full data by topic"}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            {isTh ? "กดปุ่ม อ่านเต็ม เพื่อเปิดหน้าอ่านจริงผ่านลิงก์ แต่ละหมวดถูกแยกให้อ่านง่าย ไม่ต้องพึ่งหน้าต่าง modal แล้ว" : "Use Read Full links to open a real readable page. Topics are separated for easier reading."}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            <Card className="p-4"><p className="text-sm text-slate-400">Runs</p><p className="text-3xl font-black text-white">{runs.length}</p></Card>
            <Card className="p-4"><p className="text-sm text-slate-400">Real Items</p><p className="text-3xl font-black text-white">{runItemCount}</p></Card>
            <Card className="p-4"><p className="text-sm text-slate-400">Readable</p><p className="text-3xl font-black text-white">{seedItemCount}</p></Card>
            <Card className="p-4"><p className="text-sm text-slate-400">Visible</p><p className="text-3xl font-black text-white">{visibleItems.length}</p></Card>
          </div>
        </div>
      </Card>

      {selectedItem ? <Reader item={selectedItem} isTh={isTh} /> : null}

      <Card className="p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition focus:border-cyan-300/50 focus:bg-slate-950/90" onChange={(event) => setQuery(event.target.value)} placeholder={isTh ? "ค้นหาข่าว US Stock News สินค้าเทค คอนเสิร์ตไทย ฟุตบอล อีเมล..." : "Search news, US Stock News, tech products, Thailand concerts, football, email..."} value={query} />
          <div className="flex flex-wrap gap-2">
            {runId && <button className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white" onClick={() => setRunId("")} type="button">{isTh ? "ดูทุกเรื่อง" : "View all"}</button>}
            <button className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white" onClick={load} type="button">🔄 {isTh ? "รีเฟรช" : "Refresh"}</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {TOPICS.map((item) => <button key={item.key} className={`nimbus-button-3d rounded-full border px-3 py-2 text-xs font-bold transition ${filter === item.key ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"}`} onClick={() => setFilter(item.key)} type="button">{item.icon} {isTh ? item.th : item.en}</button>)}
        </div>
      </Card>

      {groupedItems.map((group) => (
        <section key={group.topic.key} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-white">{group.topic.icon} {isTh ? group.topic.th : group.topic.en}</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-slate-300">{group.items.length} เรื่อง</span>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {group.items.map((item) => (
              <Card key={`${item.isSeed ? "seed" : "run"}-${item.id}`} className="nimbus-orbit p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="blue">{item.icon} {isTh ? group.topic.th : group.topic.en}</Badge>
                      <Badge tone={item.isSeed ? "purple" : statusTone(item.status)}>{item.isSeed ? (isTh ? "อ่านได้ทันที" : "Readable") : item.status}</Badge>
                    </div>
                    <Link className="mt-4 block text-left text-xl font-black leading-7 text-white hover:text-cyan-100" href={articleHref(item)}>{isTh ? item.titleTh : item.titleEn}</Link>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{compact(isTh ? item.summaryTh : item.summaryEn, 340)}</p>
                  </div>
                  <div className="shrink-0 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-right"><p className="text-2xl font-black text-cyan-100">{item.priority}</p><p className="text-[11px] uppercase tracking-wider text-slate-400">priority</p></div>
                </div>
                <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">{item.details.slice(0, 4).map((detail) => <p key={detail}>• {detail}</p>)}</div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-300/20" href={articleHref(item)}>📖 {isTh ? "อ่านเต็ม" : "Read Full"}</Link>
                  {item.runId ? <Link className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.10]" href={`/task-results/${item.runId}`}>{isTh ? "ผลลัพธ์เดิม" : "Original result"}</Link> : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      {visibleItems.length === 0 ? <Card className="p-8 text-center"><p className="text-xl font-black text-white">{isTh ? "ไม่พบข้อมูล" : "No data found"}</p><p className="mt-2 text-sm text-slate-400">{isTh ? "ลองเปลี่ยน filter หรือคำค้นหา" : "Try another filter or search query."}</p></Card> : null}
    </div>
  );
}
