"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataFreshnessIndicator } from "@/components/ui/DataFreshnessIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import { getDataFreshnessStatus, selectFreshnessTimestamp } from "@/lib/data-freshness";
import { hasUsableNewsImage } from "@/lib/news-image";
import { cn } from "@/lib/utils";
import type { DailyBriefApiResponse, DailyBriefItem } from "@/types/daily-brief";
import type { WebNotification } from "@/types/notification";
import type { ScheduledTask } from "@/types/scheduled-task";
import type { TaskRun } from "@/types/task-run";

type StockQuote = {
  symbol?: string;
  name?: string;
  price: number;
  prevClose: number;
  changePercent: number;
  volume: string;
  marketState?: string;
  updatedAt?: string;
};

type StockPayload = {
  success: boolean;
  source: string;
  sourceId: string;
  updatedAt?: string;
  fetchedAt: string;
  quotes: StockQuote[];
  error?: string;
};

type DashboardSnapshot = {
  news?: DailyBriefApiResponse;
  stocks?: StockPayload;
  tasks?: ScheduledTask[];
  runs?: TaskRun[];
  notifications?: WebNotification[];
};

type SectionKey = "global" | "market" | "topics" | "report";

const stockSymbols = ["^GSPC", "^IXIC", "^DJI", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "TSLA"].join(",");

const destinations = [
  { code: "DY", href: "/daily", th: "ข่าวประจำวัน", en: "Daily News" },
  { code: "ST", href: "/stocks", th: "รวมหุ้น", en: "Stocks" },
  { code: "CN", href: "/concerts", th: "คอนเสิร์ต", en: "Concerts" },
  { code: "MV", href: "/movies", th: "หนังและสตรีมมิง", en: "Movies & Streaming" },
  { code: "EV", href: "/events", th: "อีเวนต์", en: "Events" },
] as const;

function getNewsTitle(item: DailyBriefItem, lang: "th" | "en") {
  return lang === "th" ? item.titleTh || item.title : item.title;
}

function getNewsSummary(item: DailyBriefItem, lang: "th" | "en") {
  return lang === "th" ? item.summaryTh : item.rawDescription || item.summaryTh;
}

function newsImage(item: DailyBriefItem) {
  const imageUrl = item.imageUrl;
  if (!imageUrl || !hasUsableNewsImage(item)) return null;
  const params = new URLSearchParams({ url: imageUrl, title: item.title, kind: "news", strict: "1" });
  return `/api/poster-image?${params.toString()}`;
}

function DashboardGlobalStoryCard({ item, lang }: { item: DailyBriefItem; lang: "th" | "en" }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [item.id, item.imageUrl]);
  const image = imageFailed ? null : newsImage(item);

  return (
    <article data-news-card="dashboard-global" data-image-layout={image ? "image" : "text-only"} className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-950/50", !image && "p-4")}>
      {image ? <div className="relative aspect-[16/7] w-full"><Image src={image} alt="" fill sizes="(min-width: 1280px) 30vw, 50vw" className="object-cover" unoptimized onError={() => setImageFailed(true)} /></div> : null}
      <div className={cn("flex min-w-0 flex-1 flex-col", image && "p-4")}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="rounded-md border border-cyan-300/20 px-2 py-1 text-cyan-100">{item.category}</span>
          {item.sourceMetadata?.addedInCurrentUpgrade ? <span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-emerald-100">{lang === "th" ? "แหล่งข้อมูลใหม่" : "New source"}</span> : null}
          {item.relatedSources.length ? <span className="text-slate-500">+{item.relatedSources.length} sources</span> : null}
        </div>
        <h3 className={cn("mt-3 font-extrabold leading-6 text-white", image ? "line-clamp-2 text-base" : "text-lg")}><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-100">{getNewsTitle(item, lang)}</a></h3>
        <p className={cn("mt-2 text-sm leading-6 text-slate-400", image && "line-clamp-2")}>{getNewsSummary(item, lang)}</p>
        <p className="mt-auto pt-3 text-xs text-slate-500">{item.sourceName}</p>
      </div>
    </article>
  );
}

function percentage(quote: StockQuote) {
  if (Number.isFinite(quote.changePercent)) return quote.changePercent;
  return quote.prevClose ? ((quote.price - quote.prevClose) / quote.prevClose) * 100 : 0;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

function useCollapsedSections() {
  const [collapsed, setCollapsed] = useState<Set<SectionKey>>(() => new Set(["report"]));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("nimbusdaily-dashboard-collapsed");
      if (raw) setCollapsed(new Set(JSON.parse(raw) as SectionKey[]));
    } catch {
      setCollapsed(new Set(["report"]));
    }
  }, []);

  const toggle = useCallback((key: SectionKey) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      window.localStorage.setItem("nimbusdaily-dashboard-collapsed", JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { collapsed, toggle };
}

function SectionHeading({ id, title, description, href, collapsed, onToggle, lang }: {
  id: string;
  title: string;
  description: string;
  href?: string;
  collapsed: boolean;
  onToggle: () => void;
  lang: "th" | "en";
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
      <div>
        <h2 id={id} className="text-lg font-extrabold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {href ? <Link href={href} className="rounded-md border border-cyan-300/20 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-300/10">{lang === "th" ? "ดูทั้งหมด" : "View all"}</Link> : null}
        <button type="button" onClick={onToggle} aria-expanded={!collapsed} aria-controls={`${id}-content`} title={collapsed ? "Expand" : "Collapse"} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-slate-300 hover:bg-white/[0.06]">
          {collapsed ? "+" : "−"}
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-24 animate-pulse rounded-lg bg-white/[0.05]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-lg bg-white/[0.05]" />)}
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-white/[0.05]" />
    </div>
  );
}

export function DashboardOverviewView() {
  const { lang } = useLanguage();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestRef = useRef(0);
  const { collapsed, toggle } = useCollapsedSections();

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    const requestId = ++requestRef.current;
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    const refresh = forceRefresh ? `&refresh=${Date.now()}` : "";
    const newsPath = forceRefresh ? `/api/news/latest?refresh=${Date.now()}` : "/api/news/latest";
    const results = await Promise.allSettled([
      apiRequest<DailyBriefApiResponse>(newsPath),
      fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(stockSymbols)}${refresh}`, { cache: "no-store" }).then(async (response) => {
        const payload = await response.json() as StockPayload;
        if (!response.ok || !payload.success) throw new Error(payload.error || "Stock data unavailable");
        return payload;
      }),
      apiRequest<ScheduledTask[]>("/api/scheduled-tasks"),
      apiRequest<TaskRun[]>("/api/task-runs"),
      apiRequest<WebNotification[]>("/api/notifications"),
    ]);
    if (requestId !== requestRef.current) return;

    const nextErrors: Record<string, string> = {};
    setSnapshot((current) => {
      const next = { ...current };
      const keys: Array<keyof DashboardSnapshot> = ["news", "stocks", "tasks", "runs", "notifications"];
      results.forEach((result, index) => {
        const key = keys[index];
        if (result.status === "fulfilled") Object.assign(next, { [key]: result.value });
        else nextErrors[key] = toErrorMessage(result.reason);
      });
      return next;
    });
    setErrors(nextErrors);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
    return () => {
      requestRef.current += 1;
    };
  }, [loadDashboard]);

  const news = snapshot.news;
  const quotes = snapshot.stocks?.quotes ?? [];
  const globalStories = news?.summary.globalTopStories ?? [];
  const topCategory = useMemo(() => {
    const counts = (news?.items ?? []).reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }, [news]);
  const positiveQuotes = quotes.filter((quote) => percentage(quote) > 0).length;
  const sourceNames = news?.processingReport?.sourceNames ?? [];
  const newsTimestamp = news?.freshness ? selectFreshnessTimestamp(news.freshness)?.value : undefined;
  const newsStatus = news?.freshness ? getDataFreshnessStatus("news", news.freshness) : "unavailable";
  const stockFreshness = snapshot.stocks ? { sourceUpdatedAt: snapshot.stocks.updatedAt, fetchedAt: snapshot.stocks.fetchedAt } : {};
  const stockStatus = snapshot.stocks ? getDataFreshnessStatus("stock", stockFreshness) : "unavailable";
  const cacheHint = news?.processingReport?.cacheStatus === "hit"
    ? (lang === "th" ? "ใช้ข้อมูลที่ตรวจแล้ว" : "Verified cache")
    : news?.processingReport?.cacheStatus === "miss"
      ? (lang === "th" ? "ดึงและตรวจใหม่" : "Fetched and verified")
      : (lang === "th" ? "ยังไม่มีสถานะ" : "Unavailable");

  if (isLoading && !Object.keys(snapshot).length) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-cyan-200">NimbusDaily Overview</p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{lang === "th" ? "ภาพรวมสำคัญในหน้าเดียว" : "Everything important, in one view"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{lang === "th" ? "ข่าวทั่วโลก ตลาด และสถานะข้อมูลล่าสุดจากแหล่งที่ระบบใช้งานจริง" : "Global stories, markets, and source health from live system data."}</p>
        </div>
        <button type="button" onClick={() => void loadDashboard(true)} disabled={isRefreshing} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-extrabold text-cyan-50 hover:bg-cyan-300/15 disabled:opacity-60">
          <span aria-hidden="true">↻</span>{isRefreshing ? (lang === "th" ? "กำลังอัปเดต" : "Refreshing") : (lang === "th" ? "อัปเดตข้อมูล" : "Refresh")}
        </button>
      </header>

      {Object.keys(errors).length ? (
        <div role="status" className="rounded-lg border border-amber-300/25 bg-amber-300/[0.07] p-3 text-sm text-amber-100">
          {lang === "th" ? `แสดงข้อมูลบางส่วน: ${Object.keys(errors).join(", ")}` : `Partial data: ${Object.keys(errors).join(", ")}`}
        </div>
      ) : null}

      <section aria-label={lang === "th" ? "สรุปภาพรวม" : "Overview summary"} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: lang === "th" ? "ข่าวไม่เกิน 48 ชม." : "News under 48h", value: news?.items.length ?? 0, hint: cacheHint, tone: "cyan" },
          { label: lang === "th" ? "ข่าวเด่นทั่วโลก" : "Global Top Stories", value: globalStories.length, hint: `${news?.processingReport?.newSourceNames.length ?? 0} ${lang === "th" ? "แหล่งใหม่" : "new source"}`, tone: "violet" },
          { label: lang === "th" ? "ภาพรวมตลาด" : "Market breadth", value: quotes.length ? `${positiveQuotes}/${quotes.length}` : "-", hint: lang === "th" ? "สินทรัพย์เป็นบวก" : "assets positive", tone: "emerald" },
          { label: lang === "th" ? "หัวข้อเด่น" : "Trending topic", value: topCategory?.[0] ?? "-", hint: topCategory ? `${topCategory[1]} ${lang === "th" ? "ข่าว" : "stories"}` : (lang === "th" ? "ไม่มีข้อมูล" : "Unavailable"), tone: "amber" },
        ].map((card) => (
          <article key={card.label} className={cn("rounded-lg border p-4", card.tone === "cyan" && "border-cyan-300/20 bg-cyan-300/[0.055]", card.tone === "violet" && "border-violet-300/20 bg-violet-300/[0.055]", card.tone === "emerald" && "border-emerald-300/20 bg-emerald-300/[0.055]", card.tone === "amber" && "border-amber-300/20 bg-amber-300/[0.055]") }>
            <p className="text-xs font-bold text-slate-400">{card.label}</p>
            <p className="mt-2 truncate text-2xl font-black text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="global-heading" className="space-y-4">
        <SectionHeading id="global-heading" title={lang === "th" ? "ข่าวเด่นทั่วโลก" : "Global Top Stories"} description={lang === "th" ? "จัดอันดับจากความใหม่ ความสำคัญ และจำนวนแหล่งข่าวที่เกี่ยวข้อง" : "Ranked by recency, relevance, and cross-source coverage."} href="/daily?category=world" collapsed={collapsed.has("global")} onToggle={() => toggle("global")} lang={lang} />
        {!collapsed.has("global") ? (
          <div id="global-heading-content">
            <DataFreshnessIndicator updatedAt={newsTimestamp} status={newsStatus} sourceNames={sourceNames} label={lang === "th" ? "ข่าว" : "News"} lang={lang} />
            {globalStories.length ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {globalStories.slice(0, 6).map((item) => <DashboardGlobalStoryCard key={item.id} item={item} lang={lang} />)}
              </div>
            ) : <p className="mt-3 rounded-lg border border-dashed border-white/10 p-6 text-sm text-slate-400">{errors.news ?? (lang === "th" ? "ยังไม่มีข่าวทั่วโลกที่ผ่านเงื่อนไข 48 ชั่วโมง" : "No qualifying global stories in the last 48 hours.")}</p>}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="market-heading" className="space-y-4">
        <SectionHeading id="market-heading" title={lang === "th" ? "ตลาดและหุ้น" : "Markets & Stocks"} description={lang === "th" ? "สรุปเฉพาะราคาและการเปลี่ยนแปลงที่จำเป็น" : "A compact view of prices and market movement."} href="/stocks" collapsed={collapsed.has("market")} onToggle={() => toggle("market")} lang={lang} />
        {!collapsed.has("market") ? (
          <div id="market-heading-content">
            <DataFreshnessIndicator updatedAt={snapshot.stocks?.updatedAt ?? snapshot.stocks?.fetchedAt} status={stockStatus} sourceNames={snapshot.stocks?.source ? [snapshot.stocks.source] : []} label={lang === "th" ? "ตลาด" : "Market"} lang={lang} />
            {quotes.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{quotes.map((quote) => { const change = percentage(quote); return <article key={quote.symbol} className="rounded-lg border border-white/10 bg-slate-950/50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-black text-white">{quote.symbol}</p><p className="mt-0.5 truncate text-xs text-slate-500">{quote.name || quote.volume}</p></div><span className={cn("text-sm font-black", change >= 0 ? "text-emerald-300" : "text-rose-300")}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span></div><p className="mt-3 text-lg font-extrabold text-slate-100">{formatPrice(quote.price)}</p></article>; })}</div> : <p className="mt-3 rounded-lg border border-dashed border-white/10 p-6 text-sm text-slate-400">{errors.stocks ?? (lang === "th" ? "ข้อมูลตลาดไม่พร้อมใช้งาน" : "Market data unavailable")}</p>}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="topics-heading" className="space-y-4">
        <SectionHeading id="topics-heading" title={lang === "th" ? "หัวข้อทั้งหมด" : "All Topics"} description={lang === "th" ? "เปิดรายละเอียดเต็มตาม Route เดิม" : "Open full details in the existing routes."} collapsed={collapsed.has("topics")} onToggle={() => toggle("topics")} lang={lang} />
        {!collapsed.has("topics") ? <div id="topics-heading-content" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{destinations.map((item) => <Link key={item.href} href={item.href} className="flex min-h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 hover:border-cyan-300/25 hover:bg-cyan-300/[0.055]"><span className="grid h-9 w-9 place-items-center rounded-md border border-cyan-300/20 text-xs font-black text-cyan-100">{item.code}</span><span className="font-bold text-slate-200">{lang === "th" ? item.th : item.en}</span></Link>)}</div> : null}
      </section>

      <section aria-labelledby="report-heading" className="space-y-4">
        <SectionHeading id="report-heading" title={lang === "th" ? "รายงานการรวมข้อมูล" : "Data Merge Report"} description={lang === "th" ? "จำนวนก่อนและหลัง validation, retention และ deduplication" : "Counts before and after validation, retention, and deduplication."} collapsed={collapsed.has("report")} onToggle={() => toggle("report")} lang={lang} />
        {!collapsed.has("report") ? (
          <div id="report-heading-content" className="overflow-x-auto rounded-lg border border-white/10">
            {news?.processingReport ? <table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/[0.04] text-xs text-slate-400"><tr><th className="px-4 py-3">{lang === "th" ? "หมวด" : "Category"}</th><th className="px-4 py-3">{lang === "th" ? "ก่อน" : "Before"}</th><th className="px-4 py-3">{lang === "th" ? "จากแหล่งใหม่" : "New source"}</th><th className="px-4 py-3">{lang === "th" ? "หมดอายุ" : "Expired"}</th><th className="px-4 py-3">{lang === "th" ? "ซ้ำ" : "Duplicate"}</th><th className="px-4 py-3">Invalid</th><th className="px-4 py-3">{lang === "th" ? "สุทธิ" : "Net"}</th></tr></thead><tbody>{news.processingReport.categories.map((row) => <tr key={row.category} className="border-t border-white/10 text-slate-300"><td className="px-4 py-3 font-bold text-white">{row.category}</td><td className="px-4 py-3">{row.beforeCount}</td><td className="px-4 py-3 text-emerald-300">+{row.addedFromNewSources}</td><td className="px-4 py-3 text-amber-300">-{row.removedExpired}</td><td className="px-4 py-3 text-amber-300">-{row.removedDuplicates}</td><td className="px-4 py-3 text-rose-300">-{row.removedInvalid}</td><td className="px-4 py-3 font-black text-cyan-100">{row.netCount}</td></tr>)}</tbody></table> : <p className="p-6 text-sm text-slate-400">{lang === "th" ? "ยังไม่มีรายงานจาก API" : "No API report available"}</p>}
          </div>
        ) : null}
      </section>

      <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-slate-500">
        <span>{lang === "th" ? "งานที่เปิด" : "Active tasks"}: {snapshot.tasks?.filter((task) => task.isActive).length ?? 0}</span>
        <span>{lang === "th" ? "ผลรันล่าสุด" : "Recent runs"}: {snapshot.runs?.length ?? 0}</span>
        <span>{lang === "th" ? "แจ้งเตือนยังไม่อ่าน" : "Unread"}: {snapshot.notifications?.filter((item) => !item.isRead).length ?? 0}</span>
      </footer>
    </div>
  );
}
