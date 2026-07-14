"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getContentFreshness, getFreshnessClass, getFreshnessLabel } from "@/lib/content-freshness";
import { cn } from "@/lib/utils";

type ViewId = "overview" | "market" | "heatmap" | "category";

type Quote = {
  symbol: string;
  price: number;
  prevClose: number;
  afterHours: number;
  marketCap: string;
  volume: string;
  marketState?: string;
  updatedAt?: string;
};

type StockItem = {
  ticker: string;
  yahoo?: string;
  name: string;
  theme: string;
  category: string;
  thesis: string;
  strength: string;
  risk: string;
  tags: string[];
  accent: string;
  spark: number[];
  quote: Quote;
};

type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  image: "ai" | "chip" | "cloud" | "fintech" | "space" | "health" | "etf" | "assets" | "growth";
  overviewTitle: string;
  overview: string;
  tags: string[];
  why: string[];
  stocks: StockItem[];
};

type QuoteApiItem = Partial<Quote> & { symbol?: string };

type QuoteApiPayload = {
  success?: boolean;
  source?: string;
  fallback?: boolean;
  quotes?: QuoteApiItem[];
  updatedAt?: string;
  error?: string;
};

const stockQuoteSnapshotStorageKey = "nimbusdaily-stock-quote-snapshot";

const navItems: { id: ViewId; title: string; icon: string }[] = [
  { id: "overview", title: "Stock Overview", icon: "↗" },
  { id: "market", title: "สถานะตลาด", icon: "●" },
  { id: "heatmap", title: "Heatmap", icon: "▦" },
];

const seedQuotes: Record<string, Quote> = {
  NVDA: q("NVDA", 945.12, 937.8, 950.35, "2.34T", "24.53M"),
  MSFT: q("MSFT", 420.26, 418.81, 420.9, "3.11T", "24.17M"),
  GOOGL: q("GOOGL", 172.64, 171.48, 171.16, "2.12T", "18.92M"),
  AMZN: q("AMZN", 184.72, 185.63, 184.3, "1.92T", "31.40M"),
  META: q("META", 485.3, 482.18, 486.8, "1.23T", "16.21M"),
  AVGO: q("AVGO", 1638.74, 1620.35, 1650.2, "745.32B", "12.34M"),
  AMD: q("AMD", 157.21, 154.07, 158.1, "214.80B", "32.09M"),
  TSM: q("TSM", 153.48, 151.82, 154.2, "792.15B", "9.72M"),
  ASML: q("ASML", 974.0, 966.5, 978.4, "382.40B", "1.21M"),
  MU: q("MU", 126.8, 125.78, 127.25, "140.66B", "19.80M"),
  QCOM: q("QCOM", 198.33, 196.9, 199.1, "221.04B", "7.91M"),
  CRWD: q("CRWD", 325.6, 327.88, 324.4, "79.30B", "3.18M"),
  PANW: q("PANW", 319.52, 318.66, 320.1, "103.27B", "2.80M"),
  NET: q("NET", 83.14, 82.45, 83.6, "28.44B", "3.78M"),
  DDOG: q("DDOG", 121.33, 120.68, 121.95, "40.50B", "2.67M"),
  SNOW: q("SNOW", 136.92, 136.12, 137.22, "45.60B", "5.24M"),
  V: q("V", 278.41, 277.28, 279.0, "556.20B", "6.20M"),
  MA: q("MA", 456.81, 454.18, 458.0, "424.10B", "2.70M"),
  HOOD: q("HOOD", 22.64, 22.1, 22.85, "19.84B", "20.10M"),
  SOFI: q("SOFI", 7.82, 7.74, 7.9, "8.31B", "33.11M"),
  RKLB: q("RKLB", 6.48, 6.29, 6.66, "3.21B", "9.54M"),
  LMT: q("LMT", 468.1, 467.2, 468.45, "112.20B", "1.18M"),
  GEV: q("GEV", 164.52, 163.6, 165.3, "45.25B", "2.81M"),
  CEG: q("CEG", 211.35, 210.22, 212.1, "66.90B", "2.24M"),
  ASTS: q("ASTS", 11.75, 11.35, 12.0, "3.40B", "7.66M"),
  LLY: q("LLY", 885.2, 874.02, 889.1, "841.00B", "2.21M"),
  UNH: q("UNH", 512.45, 510.46, 513.0, "471.30B", "3.20M"),
  COST: q("COST", 842.11, 836.84, 844.0, "373.20B", "1.64M"),
  WMT: q("WMT", 68.35, 67.97, 68.48, "550.10B", "15.24M"),
  MCD: q("MCD", 257.88, 258.68, 257.3, "185.61B", "3.44M"),
  "BRK.B": q("BRK.B", 407.22, 406.49, 407.9, "876.00B", "4.18M"),
  VOO: q("VOO", 488.22, 486.18, 489.0, "1.14T", "4.40M"),
  VTI: q("VTI", 267.45, 266.21, 268.02, "1.58T", "3.21M"),
  QQQ: q("QQQ", 462.8, 459.3, 464.4, "295.00B", "32.11M"),
  SCHD: q("SCHD", 78.22, 77.98, 78.3, "56.20B", "4.23M"),
  BND: q("BND", 72.1, 72.01, 72.08, "108.40B", "6.92M"),
  GLD: q("GLD", 216.44, 215.98, 216.9, "61.00B", "6.02M"),
  BTC: q("BTC", 62180.0, 61340.0, 62410.0, "1.22T", "42.00B"),
  ETH: q("ETH", 3410.0, 3394.0, 3425.0, "409.00B", "18.20B"),
  LINK: q("LINK", 14.82, 14.54, 14.9, "8.75B", "542.00M"),
  ARM: q("ARM", 164.25, 162.4, 165.0, "171.20B", "5.87M"),
  MRVL: q("MRVL", 71.44, 70.92, 71.9, "61.80B", "10.11M"),
  ANET: q("ANET", 331.7, 329.12, 333.05, "103.70B", "2.22M"),
  VRT: q("VRT", 91.1, 89.88, 92.0, "34.20B", "6.45M"),
  APP: q("APP", 82.34, 81.43, 83.0, "27.70B", "3.50M"),
  RDDT: q("RDDT", 63.2, 62.1, 63.8, "10.11B", "8.40M"),
  MELI: q("MELI", 1688.5, 1679.4, 1692.0, "85.60B", "430.00K"),
  ISRG: q("ISRG", 431.24, 429.1, 432.0, "153.10B", "1.74M"),
};

const categories: Category[] = [
  category("ai-mega-cap", "AI / Mega Cap", "หุ้นผู้นำเทคโนโลยีและ AI ขนาดใหญ่ของสหรัฐฯ", "AI", "ai", "ภาพรวมหมวด AI / Mega Cap", "กลุ่มผู้นำ AI, Cloud, Advertising, Enterprise Software และ Data Center Infrastructure ที่เป็นแกนหลักของระบบนิเวศดิจิทัลโลก", ["Core AI", "Mega Cap", "Cloud", "Data Center", "Ads"], ["NVDA", "MSFT", "GOOGL", "AMZN", "META", "AVGO"]),
  category("semiconductor", "Semiconductor", "หุ้นและธุรกิจโครงสร้างพื้นฐานชิปที่ได้อานิสงส์จาก AI", "SC", "chip", "ภาพรวมหมวด Semiconductor", "ครอบคลุมผู้ออกแบบชิป โรงงานผลิตชิป อุปกรณ์ผลิต และหน่วยความจำ ซึ่งเป็นโครงสร้างสำคัญของ AI และ Cloud", ["GPU", "Foundry", "Equipment", "Memory", "Mobile AI"], ["AMD", "TSM", "ASML", "MU", "QCOM", "AVGO", "NVDA"]),
  category("cloud-cybersecurity", "Cloud / Cybersecurity", "หุ้นคลาวด์ ซอฟต์แวร์องค์กร และความปลอดภัยไซเบอร์", "CY", "cloud", "ภาพรวมหมวด Cloud / Cybersecurity", "ธีมนี้ได้แรงหนุนจากการย้ายระบบขึ้นคลาวด์ การป้องกันข้อมูล Observability และ data platform สำหรับองค์กร", ["Cloud", "Security", "Edge", "Observability", "Data Cloud"], ["CRWD", "PANW", "NET", "DDOG", "SNOW", "MSFT"]),
  category("fintech-platform", "Fintech / Platform", "หุ้นแพลตฟอร์มชำระเงิน การเงินดิจิทัล และโบรกเกอร์รุ่นใหม่", "FP", "fintech", "ภาพรวมหมวด Fintech / Platform", "รวมเครือข่ายการชำระเงิน แพลตฟอร์มการเงิน และธุรกิจที่ได้ประโยชน์จาก cashless economy", ["Payments", "Fintech", "Trading", "Digital Bank"], ["V", "MA", "HOOD", "SOFI"]),
  category("space-defense-infra", "Space / Defense / Infra", "หุ้นธีมอวกาศ กลาโหม พลังงาน และโครงสร้างพื้นฐานสำหรับยุค AI", "SP", "space", "ภาพรวมหมวด Space / Defense / Infra", "ครอบคลุมนวัตกรรมอวกาศ กลาโหม พลังงาน และโครงสร้างพื้นฐานที่เชื่อมกับ AI data center", ["Space", "Defense", "Power", "Infra"], ["RKLB", "LMT", "GEV", "CEG", "ASTS"]),
  category("healthcare-consumer-quality", "Healthcare / Consumer / Quality", "หุ้นคุณภาพสูง แนวรับเศรษฐกิจ และธุรกิจแบรนด์แข็งแรง", "HQ", "health", "ภาพรวมหมวด Healthcare / Consumer / Quality", "กลุ่มคุณภาพสูงที่มีกระแสเงินสดและแบรนด์แข็งแรง เหมาะสำหรับดูเป็นแกนสมดุลพอร์ต", ["Healthcare", "Consumer", "Quality", "Defensive"], ["LLY", "UNH", "COST", "WMT", "MCD", "BRK.B"]),
  category("etf", "ETF", "กองทุนดัชนีและธีมยอดนิยมสำหรับกระจายพอร์ต", "EF", "etf", "ภาพรวม ETF", "ETF ช่วยกระจายการลงทุน ครอบคลุมตลาดกว้าง เทคโนโลยี หุ้นปันผล พันธบัตร และธีมเฉพาะ", ["Broad Market", "Tech", "Dividend", "Bond", "Thematic"], ["VOO", "VTI", "QQQ", "SCHD", "BND"]),
  category("alternative-assets", "Alternative Assets", "ทองคำและคริปโตสำหรับกระจายความเสี่ยงหรือเพิ่มโอกาสเติบโต", "AA", "assets", "ภาพรวม Alternative Assets", "รวมสินทรัพย์ทางเลือกอย่างทองคำและคริปโต เพื่อช่วยดูภาพรวมการกระจายความเสี่ยง", ["Gold", "Crypto", "Inflation Hedge", "Digital Asset"], ["GLD", "BTC", "ETH", "LINK"]),
  category("future-growth-picks", "Future Growth Picks", "หุ้นเติบโตที่น่าสนใจเพิ่มเติม นอกเหนือจากกลุ่มแกนหลัก", "FG", "growth", "ภาพรวม Future Growth Picks", "บริษัทธีมเติบโตจาก AI chips, networking, power infrastructure, advertising, social platforms และ robotics", ["AI Chip", "Networking", "Power", "Ads", "Robotics"], ["ARM", "MRVL", "ANET", "VRT", "APP", "RDDT", "MELI", "ISRG"]),
];

const allStocks = categories.flatMap((item) => item.stocks);
const uniqueStocks = Array.from(new Map(allStocks.map((item) => [item.ticker, item])).values());
const directViewIds = new Set<ViewId>(["overview", "market", "heatmap"]);

function parseStockHash(hash: string): { view: ViewId; categoryId?: string } | null {
  const raw = decodeURIComponent(hash.replace(/^#/, "")).trim();
  if (!raw) return null;
  if (raw.startsWith("category-")) {
    const categoryId = raw.replace(/^category-/, "");
    return categories.some((item) => item.id === categoryId) ? { view: "category", categoryId } : null;
  }
  return directViewIds.has(raw as ViewId) ? { view: raw as ViewId } : null;
}

function stockHashFor(view: ViewId, categoryId: string) {
  return view === "category" ? `category-${categoryId}` : view;
}

function quoteValuesChanged(previous: Quote | undefined, next: Quote) {
  if (!previous) return true;
  return ["price", "prevClose", "afterHours"].some((key) => Math.abs((previous[key as keyof Quote] as number) - (next[key as keyof Quote] as number)) > 0.001);
}

function getStoredQuoteSnapshot(): Record<string, Quote> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(stockQuoteSnapshotStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Quote>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredQuoteSnapshot(snapshot: Record<string, Quote>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(stockQuoteSnapshotStorageKey, JSON.stringify(snapshot));
  } catch {
    // Best-effort only; the UI still works without local persistence.
  }
}

export function StocksHubView() {
  const [view, setView] = useState<ViewId>("overview");
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);
  const [query, setQuery] = useState("");
  const [liveQuotes, setLiveQuotes] = useState<Record<string, Quote>>({});
  const [freshSymbols, setFreshSymbols] = useState<Set<string>>(new Set());
  const [staleSymbols, setStaleSymbols] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState("ใช้ fallback sample");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSource, setQuoteSource] = useState("sample fallback");
  const quoteSnapshotRef = useRef<Record<string, Quote>>({});
  const freshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const syncFromHash = () => {
      const parsed = parseStockHash(window.location.hash);
      if (!parsed) return;
      setView(parsed.view);
      if (parsed.categoryId) setActiveCategoryId(parsed.categoryId);
    };

    const searchFromUrl = new URLSearchParams(window.location.search).get("search");
    if (searchFromUrl) setQuery(searchFromUrl);
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  useEffect(() => () => {
    if (freshTimerRef.current) clearTimeout(freshTimerRef.current);
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
  }, []);

  const pushStockHash = useCallback((nextView: ViewId, nextCategoryId = activeCategoryId) => {
    if (typeof window === "undefined") return;
    const nextHash = stockHashFor(nextView, nextCategoryId);
    if (window.location.hash === `#${nextHash}`) return;
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${nextHash}`);
  }, [activeCategoryId]);

  const selectView = useCallback((nextView: ViewId) => {
    setView(nextView);
    pushStockHash(nextView);
  }, [pushStockHash]);

  const selectCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    setView("category");
    pushStockHash("category", categoryId);
  }, [pushStockHash]);

  const loadQuotes = useCallback(async (signal?: AbortSignal, manualRefresh = false) => {
    setQuoteLoading(true);
    setQuoteError("");
    if (manualRefresh) {
      const now = new Date();
      setLastUpdated(now.toLocaleString("th-TH"));
      setLastUpdatedAt(now.toISOString());
    }
    const symbols = uniqueStocks.map((item) => item.yahoo ?? item.ticker).join(",");

    try {
      const response = await fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(symbols)}&refresh=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal,
      });
      if (!response.ok) throw new Error(`quote api failed: ${response.status}`);

      const payload = (await response.json()) as QuoteApiPayload;
      const nextQuotes: Record<string, Quote> = {};
      for (const item of payload.quotes ?? []) {
        if (!item.symbol || typeof item.price !== "number") continue;
        const localTicker = uniqueStocks.find((stockItem) => (stockItem.yahoo ?? stockItem.ticker) === item.symbol)?.ticker ?? item.symbol;
        const fallback = seedQuotes[localTicker] ?? q(localTicker, item.price, item.prevClose ?? item.price, item.afterHours ?? item.price, "-", "-");
        nextQuotes[localTicker] = {
          ...fallback,
          ...item,
          symbol: localTicker,
          prevClose: typeof item.prevClose === "number" ? item.prevClose : fallback.prevClose,
          afterHours: typeof item.afterHours === "number" ? item.afterHours : fallback.afterHours,
        };
      }

      if (Object.keys(nextQuotes).length === 0) throw new Error(payload.error || "No live quotes returned");

      const previousStoredQuotes = getStoredQuoteSnapshot();
      const changedSymbols = new Set<string>();
      for (const [ticker, nextQuote] of Object.entries(nextQuotes)) {
        const previous = previousStoredQuotes[ticker] ?? quoteSnapshotRef.current[ticker] ?? seedQuotes[ticker];
        const changed = quoteValuesChanged(previous, nextQuote);
        if (changed) changedSymbols.add(ticker);
      }
      quoteSnapshotRef.current = { ...quoteSnapshotRef.current, ...nextQuotes };
      saveStoredQuoteSnapshot(quoteSnapshotRef.current);

      setLiveQuotes(nextQuotes);
      setFreshSymbols(changedSymbols);
      // An unchanged quote is valid data, not an error. Red is reserved for
      // failed or genuinely expired data instead of marking every old row.
      setStaleSymbols(new Set());
      if (freshTimerRef.current) clearTimeout(freshTimerRef.current);
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
      freshTimerRef.current = setTimeout(() => setFreshSymbols(new Set()), 18000);
      staleTimerRef.current = setTimeout(() => setStaleSymbols(new Set()), 18000);
      setQuoteSource(payload.source ?? "Yahoo Finance");
      const updatedDate = payload.updatedAt ? new Date(payload.updatedAt) : new Date();
      setLastUpdated(updatedDate.toLocaleString("th-TH"));
      setLastUpdatedAt(updatedDate.toISOString());
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setQuoteError(error instanceof Error ? error.message : "Live quote refresh failed");
      setQuoteSource("sample fallback");
      const fallbackDate = new Date();
      setLastUpdated(fallbackDate.toLocaleString("th-TH"));
      setLastUpdatedAt(fallbackDate.toISOString());
    } finally {
      if (!signal?.aborted) setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadQuotes(controller.signal);
    return () => controller.abort();
  }, [loadQuotes]);

  const hydratedStocks = useMemo(() => uniqueStocks.map((item) => ({ ...item, quote: liveQuotes[item.ticker] ?? item.quote })), [liveQuotes]);
  const activeCategory = categories.find((item) => item.id === activeCategoryId) ?? categories[0];
  const activeStocks = useMemo(() => {
    const base = activeCategory.stocks.map((item) => ({ ...item, quote: liveQuotes[item.ticker] ?? item.quote }));
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((item) => [item.ticker, item.name, item.theme, item.category, ...item.tags].join(" ").toLowerCase().includes(needle));
  }, [activeCategory, liveQuotes, query]);

  const filteredAll = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return hydratedStocks;
    return hydratedStocks.filter((item) => [item.ticker, item.name, item.theme, item.category, ...item.tags].join(" ").toLowerCase().includes(needle));
  }, [hydratedStocks, query]);

  const marketState = useMemo(
    () => Object.values(liveQuotes).find((quote) => quote.marketState)?.marketState,
    [liveQuotes],
  );

  return (
    <section className="stock-hub w-full text-slate-100">
      <div className="min-w-0 space-y-5">
          <StockTopbar
            view={view}
            category={activeCategory}
            query={query}
            setQuery={setQuery}
            lastUpdated={lastUpdated}
            lastUpdatedAt={lastUpdatedAt}
            liveCount={Object.keys(liveQuotes).length}
            quoteError={quoteError}
            quoteLoading={quoteLoading}
            quoteSource={quoteSource}
            marketState={marketState}
            onRefresh={() => void loadQuotes(undefined, true)}
          />
          <StockQuickNav view={view} activeCategoryId={activeCategoryId} onView={selectView} onCategory={selectCategory} />
          {view === "overview" && <OverviewBoard stocks={filteredAll} freshSymbols={freshSymbols} staleSymbols={staleSymbols} />}
          {view === "market" && <MarketStatus lastUpdated={lastUpdated} lastUpdatedAt={lastUpdatedAt} marketState={marketState} />}
          {view === "heatmap" && <Heatmap stocks={hydratedStocks} freshSymbols={freshSymbols} staleSymbols={staleSymbols} />}
          {view === "category" && <CategoryResearch category={activeCategory} stocks={activeStocks} freshSymbols={freshSymbols} staleSymbols={staleSymbols} />}
          <footer className="stock-footer rounded-2xl border border-white/10 bg-slate-950/45 px-5 py-4 text-center text-sm font-medium text-slate-400">
            ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน ราคาจาก API อาจล่าช้าหรือใช้ fallback เมื่อแหล่งข้อมูลไม่ตอบสนอง
          </footer>
      </div>
    </section>
  );
}

function StockQuickNav({ view, activeCategoryId, onView, onCategory }: { view: ViewId; activeCategoryId: string; onView: (id: ViewId) => void; onCategory: (id: string) => void }) {
  return (
    <nav className="nimbus-card-3d flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-950/62 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:pb-0">
        {navItems.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onPointerDown={() => onView(item.id)}
              onClick={() => onView(item.id)}
              className={cn("shrink-0 rounded-lg border px-4 py-2.5 text-sm font-extrabold transition duration-150 active:scale-[0.99]", active ? "border-cyan-300/40 bg-cyan-300/12 text-white" : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-cyan-300/30 hover:text-white")}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </button>
          );
        })}
      </div>
      <label className="flex min-w-0 items-center gap-3 text-xs font-bold text-slate-400 lg:w-80">
        <span className="shrink-0">หมวดหุ้น</span>
        <select
          aria-label="เลือกหมวดหุ้น"
          className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/80 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-300/45"
          value={view === "category" ? activeCategoryId : ""}
          onChange={(event) => {
            if (event.target.value) onCategory(event.target.value);
          }}
        >
          <option value="">เลือกหมวด</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
        </select>
      </label>
    </nav>
  );
}

function StockTopbar({
  view,
  category,
  query,
  setQuery,
  lastUpdated,
  lastUpdatedAt,
  liveCount,
  quoteError,
  quoteLoading,
  quoteSource,
  marketState,
  onRefresh,
}: {
  view: ViewId;
  category: Category;
  query: string;
  setQuery: (value: string) => void;
  lastUpdated: string;
  lastUpdatedAt: string | null;
  liveCount: number;
  quoteError: string;
  quoteLoading: boolean;
  quoteSource: string;
  marketState?: string;
  onRefresh: () => void;
}) {
  const titleMap: Record<ViewId, string> = {
    overview: "หน้ารวมหุ้น",
    market: "สถานะตลาดและเวลาอัปเดต",
    heatmap: "Heatmap ตลาดหุ้น",
    category: category.title,
  };
  const freshness = getContentFreshness({ kind: "stock", updatedAt: lastUpdatedAt });
  const freshnessTone =
    freshness.status === "new" ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-100"
    : freshness.status === "expired" ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
    : "border-slate-300/20 bg-white/[0.06] text-slate-200";
  const market = getMarketStateCopy(marketState);

  return (
    <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <div>
        <h1 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">{titleMap[view]}</h1>
        <p className="mt-2 text-sm font-medium text-slate-300 sm:text-base">{view === "category" ? category.subtitle : "ติดตามราคา แนวโน้ม และสถานะข้อมูลของสินทรัพย์ทั้งหมดในหน้าเดียว"}</p>
        <label className="relative mt-4 block">
          <span className="sr-only">ค้นหาหุ้น</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-lg border border-white/10 bg-slate-950/55 pl-12 pr-4 text-sm font-semibold text-white transition focus:border-cyan-300/45" placeholder="ค้นหาหุ้น, Ticker, บริษัท หรือหมวดหมู่..." />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className={cn("nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/60 p-4", getFreshnessClass(freshness.status))}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-400">ตลาดสหรัฐ</p>
            <span className={cn("rounded-md border px-3 py-1 text-xs font-extrabold", market.className)}>{market.label}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-extrabold text-white">Live / Delayed</p>
              <p className="text-sm font-semibold text-slate-400">อัปเดตล่าสุด: {lastUpdated}</p>
              <p className="mt-1 text-xs font-bold text-cyan-100/80">{quoteSource} · {liveCount || "sample"} quotes</p>
              <span className={cn("mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold", freshnessTone)}>
                {getFreshnessLabel(freshness.status, "th")}
              </span>
            </div>
            <button
              type="button"
              disabled={quoteLoading}
              onClick={onRefresh}
              className="rounded-xl border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-xs font-extrabold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {quoteLoading ? "กำลังอัปเดต..." : "อัปเดตราคาสด"}
            </button>
          </div>
          {quoteError ? <p className="mt-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100">ใช้ sample ชั่วคราว: {quoteError}</p> : null}
        </div>
      </div>
    </header>
  );
}

function OverviewBoard({
  stocks,
  freshSymbols,
  staleSymbols,
}: {
  stocks: StockItem[];
  freshSymbols?: Set<string>;
  staleSymbols?: Set<string>;
}) {
  const gainers = stocks.filter((item) => change(item.quote) > 0);
  const losers = stocks.filter((item) => change(item.quote) < 0);
  const afterMovers = stocks.filter((item) => afterChange(item.quote) !== 0).length;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="จำนวนหุ้นที่ติดตาม" value={stocks.length.toString()} sub="รวมทุกหมวด" icon="☆" tone="blue" />
        <MetricCard title="หุ้นบวกวันนี้" value={gainers.length.toString()} sub={`${stocks.length ? Math.round((gainers.length / stocks.length) * 100) : 0}% ของทั้งหมด`} icon="↗" tone="green" />
        <MetricCard title="หุ้นลบวันนี้" value={losers.length.toString()} sub={`${stocks.length ? Math.round((losers.length / stocks.length) * 100) : 0}% ของทั้งหมด`} icon="↘" tone="red" />
        <MetricCard title="After Hours เด่น" value={afterMovers.toString()} sub="มีราคาเปลี่ยนแปลง" icon="☾" tone="violet" />
      </div>
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <PriceTable title="Stock Overview Board" stocks={stocks} compact={false} freshSymbols={freshSymbols} staleSymbols={staleSymbols} />
        <aside className="space-y-5">
          <HowToRead />
          <TopMovers stocks={stocks} />
        </aside>
      </div>
    </div>
  );
}

function CategoryResearch({ category, stocks, freshSymbols, staleSymbols }: { category: Category; stocks: StockItem[]; freshSymbols?: Set<string>; staleSymbols?: Set<string> }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <main className="min-w-0 space-y-5">
        <OverviewPanel category={category} />
        <PriceTable title={`หุ้นในหมวด ${category.title}`} stocks={stocks} compact={false} freshSymbols={freshSymbols} staleSymbols={staleSymbols} />
      </main>
      <aside className="space-y-5">
        <WhyWatch items={category.why} />
        <MarketSummary />
      </aside>
    </div>
  );
}

function PriceTable({ title, stocks, compact, freshSymbols, staleSymbols }: { title: string; stocks: StockItem[]; compact: boolean; freshSymbols?: Set<string>; staleSymbols?: Set<string> }) {
  return (
    <article className="nimbus-card-3d overflow-hidden rounded-lg border border-white/10 bg-slate-950/62">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">พบ {stocks.length} สินทรัพย์</p>
        </div>
        <span className="hidden text-sm font-bold text-slate-400 sm:block">Today / Prev Close / After Hours</span>
      </div>
      {stocks.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-lg font-extrabold text-white">ไม่พบหุ้นที่ตรงกับคำค้น</p>
          <p className="mt-2 text-sm text-slate-400">ลองค้นหาด้วย Ticker ชื่อบริษัท หรือเลือกหมวดอื่น</p>
        </div>
      ) : null}
      <div className={cn("hidden overflow-x-auto lg:block", stocks.length === 0 && "lg:hidden")}>
        <table className="w-full min-w-[1120px] text-left">
          <thead className="text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Company / Theme</th>
              <th className="px-4 py-3">Trend</th>
              <th className="px-4 py-3">ราคาวันนี้</th>
              <th className="px-4 py-3">ปิดเมื่อวาน</th>
              <th className="px-4 py-3">เปลี่ยนแปลง</th>
              <th className="px-4 py-3">After Hours</th>
              <th className="px-4 py-3">มุมมอง</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((item) => {
              const daily = change(item.quote);
              const dailyPct = changePct(item.quote);
              const after = afterChangePct(item.quote);
              return (
                <tr key={`${item.ticker}-${title}`} className={cn("border-t border-white/8 transition hover:bg-white/[0.04]", freshSymbols?.has(item.ticker) && "nimbus-live-new-row", staleSymbols?.has(item.ticker) && "nimbus-live-stale")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-slate-500">☆</span>
                      <LogoBadge item={item} />
                      <div>
                        <p className="text-lg font-extrabold text-white">{item.ticker}</p>
                        {!compact && <p className="text-xs font-semibold text-slate-500">{item.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-200">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-md bg-blue-500/14 px-2 py-0.5 text-[11px] font-bold text-blue-200">{tag}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3"><div className="h-10 w-28"><Sparkline values={item.spark} violet={daily < 0} /></div></td>
                  <td className={cn("px-4 py-3 text-lg font-extrabold", daily >= 0 ? "text-emerald-300" : "text-rose-300")}>{formatPrice(item.quote.price)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-300">{formatPrice(item.quote.prevClose)}</td>
                  <td className={cn("px-4 py-3 font-extrabold", daily >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {signed(daily)} <span className="ml-2">{signedPct(dailyPct)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 font-bold text-slate-200">
                      ☾ {formatPrice(item.quote.afterHours)}
                      <span className={after >= 0 ? "text-emerald-300" : "text-rose-300"}>{signedPct(after)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3"><ViewBadge value={dailyPct} risk={item.risk} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {stocks.length > 0 ? (
        <div className="divide-y divide-white/8 lg:hidden">
          {stocks.map((item) => {
            const daily = change(item.quote);
            const dailyPct = changePct(item.quote);
            const after = afterChangePct(item.quote);
            return (
              <article key={`${item.ticker}-${title}-mobile`} className={cn("p-4", freshSymbols?.has(item.ticker) && "nimbus-live-new-row")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoBadge item={item} />
                    <div className="min-w-0">
                      <p className="text-lg font-extrabold text-white">{item.ticker}</p>
                      <p className="truncate text-xs font-semibold text-slate-400">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-lg font-extrabold text-white">{formatPrice(item.quote.price)}</p>
                    <p className={cn("text-sm font-extrabold", daily > 0 ? "text-emerald-300" : daily < 0 ? "text-rose-300" : "text-slate-400")}>{signedPct(dailyPct)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-white/[0.04] p-2"><p className="text-slate-500">ปิดก่อนหน้า</p><p className="mt-1 font-bold text-slate-200 tabular-nums">{formatPrice(item.quote.prevClose)}</p></div>
                  <div className="rounded-md bg-white/[0.04] p-2"><p className="text-slate-500">เปลี่ยน</p><p className="mt-1 font-bold text-slate-200 tabular-nums">{signed(daily)}</p></div>
                  <div className="rounded-md bg-white/[0.04] p-2"><p className="text-slate-500">After Hours</p><p className={cn("mt-1 font-bold tabular-nums", after > 0 ? "text-emerald-300" : after < 0 ? "text-rose-300" : "text-slate-300")}>{signedPct(after)}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{item.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-md bg-cyan-300/8 px-2 py-1 text-[11px] font-bold text-cyan-100">{tag}</span>)}</div>
              </article>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}

function MarketStatus({ lastUpdated, lastUpdatedAt, marketState }: { lastUpdated: string; lastUpdatedAt: string | null; marketState?: string }) {
  const freshness = getContentFreshness({ kind: "stock", updatedAt: lastUpdatedAt });
  const freshnessTone =
    freshness.status === "new" ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-100"
    : freshness.status === "expired" ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
    : "border-slate-300/20 bg-white/[0.06] text-slate-200";
  const market = getMarketStateCopy(marketState);

  return (
    <div className="space-y-5">
      <article className={cn("nimbus-card-3d grid gap-6 rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-950/70 to-slate-950 p-6 lg:grid-cols-[minmax(0,1fr)_28rem]", getFreshnessClass(freshness.status))}>
        <div className="flex items-center gap-6">
          <div className="relative grid h-44 w-44 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/10">
            <span className="absolute h-28 w-28 rounded-full border border-emerald-300/45" />
            <span className="absolute h-16 w-16 rounded-full border border-emerald-300/45" />
            <span className="h-5 w-5 rounded-full bg-emerald-300 shadow-[0_0_28px_rgba(52,211,153,.7)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-300">ตลาดสหรัฐ:</p>
            <p className="mt-2 text-4xl font-extrabold text-white sm:text-5xl">{market.label}</p>
            <span className={cn("mt-3 inline-flex rounded-md border px-4 py-2 text-sm font-extrabold", market.className)}>{market.shortLabel}</span>
          </div>
        </div>
        <div className="space-y-5 border-white/10 lg:border-l lg:pl-8">
          <InfoLine label="อัปเดตล่าสุด" value={lastUpdated} />
          <div className={cn("rounded-2xl border px-4 py-3 text-sm font-extrabold", freshnessTone)}>
            {getFreshnessLabel(freshness.status, "th")}
          </div>
          <InfoLine label="ข้อมูลราคา" value="Real-time / Delayed 15 min" />
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
            <InfoLine label="เวลาสหรัฐฯ (ET)" value="09:30 - 16:00" />
            <InfoLine label="เวลาไทย (ICT)" value="20:30 - 03:00" />
          </div>
        </div>
      </article>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {marketIndexes.map((item) => <MarketIndexCard key={item.label} item={item} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_34rem]">
        <TradingSession />
        <HowToRead />
      </div>
    </div>
  );
}

function Heatmap({ stocks, freshSymbols, staleSymbols }: { stocks: StockItem[]; freshSymbols?: Set<string>; staleSymbols?: Set<string> }) {
  const [mode, setMode] = useState("Heatmap");
  const groups = [
    ["เทคโนโลยี", stocks.filter((item) => ["AI / Mega Cap", "Semiconductor", "Cloud / Cybersecurity"].includes(item.category))],
    ["บริการผู้บริโภค", stocks.filter((item) => ["AMZN", "META", "MCD", "COST"].includes(item.ticker))],
    ["เฮลธ์แคร์", stocks.filter((item) => item.category.includes("Healthcare"))],
    ["ETF / ดัชนี", stocks.filter((item) => item.category === "ETF")],
    ["สินทรัพย์ทางเลือก", stocks.filter((item) => item.category === "Alternative Assets")],
  ] as const;
  const afterUp = [...stocks].filter((item) => afterChangePct(item.quote) > 0).sort((a, b) => afterChangePct(b.quote) - afterChangePct(a.quote));
  const afterDown = [...stocks].filter((item) => afterChangePct(item.quote) < 0).sort((a, b) => afterChangePct(a.quote) - afterChangePct(b.quote));
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <main className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {["Heatmap", "S&P 500", "AI Theme", "Semiconductor", "ETF Heatmap"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn("rounded-xl px-4 py-2 text-sm font-extrabold transition hover:-translate-y-0.5", mode === item ? "bg-blue-600 text-white" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/30 hover:text-white")}
              aria-pressed={mode === item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_.9fr]">
          {groups.map(([title, items]) => (
            <section key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
              <h3 className="mb-2 font-extrabold text-white">{title}</h3>
              <div className="grid auto-rows-[5.5rem] grid-cols-2 gap-2 md:grid-cols-3">
                {items.map((item, index) => <HeatTile key={item.ticker} item={item} big={index < 2} fresh={freshSymbols?.has(item.ticker)} stale={staleSymbols?.has(item.ticker)} />)}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <AfterHoursPanel title="After Hours ขึ้น" stocks={afterUp} tone="up" freshSymbols={freshSymbols} staleSymbols={staleSymbols} />
          <AfterHoursPanel title="After Hours ลง" stocks={afterDown} tone="down" freshSymbols={freshSymbols} staleSymbols={staleSymbols} />
        </div>
      </main>
      <aside className="space-y-5">
        <TopMovers stocks={stocks} title="Top Positive Sectors" />
        <HowToRead title="How to Read Heatmap" />
      </aside>
    </div>
  );
}

function AfterHoursPanel({ title, stocks, tone, freshSymbols, staleSymbols }: { title: string; stocks: StockItem[]; tone: "up" | "down"; freshSymbols?: Set<string>; staleSymbols?: Set<string> }) {
  const positive = tone === "up";
  return (
    <section className={cn("rounded-2xl border p-4", positive ? "border-emerald-300/25 bg-emerald-400/[0.08]" : "border-rose-300/25 bg-rose-400/[0.08]")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-white">{positive ? "🌙" : "⚠"} {title}</h3>
        <span className={cn("rounded-full px-3 py-1 text-xs font-black", positive ? "bg-emerald-300/15 text-emerald-100" : "bg-rose-300/15 text-rose-100")}>{stocks.length} tickers</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {stocks.map((item) => {
          const pct = afterChangePct(item.quote);
          return (
            <div key={`${title}-${item.ticker}`} className={cn("rounded-xl border border-white/10 bg-slate-950/45 p-3", freshSymbols?.has(item.ticker) && "nimbus-live-new", staleSymbols?.has(item.ticker) && "nimbus-live-stale")}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LogoBadge item={item} small />
                  <span className="font-extrabold text-white">{item.ticker}</span>
                </div>
                <span className={pct >= 0 ? "font-extrabold text-emerald-300" : "font-extrabold text-rose-300"}>{signedPct(pct)}</span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3 text-xs font-bold text-slate-400">
                <span>After Hours</span>
                <span className="text-white">{formatPrice(item.quote.afterHours)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OverviewPanel({ category }: { category: Category }) {
  return (
    <article className="nimbus-card-3d overflow-hidden rounded-2xl border border-blue-300/20 bg-slate-950/58">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-cyan-100">{category.icon}</span><h2 className="text-2xl font-extrabold text-white">{category.overviewTitle}</h2></div>
          <p className="mt-4 text-base font-medium leading-8 text-slate-300">{category.overview}</p>
          <div className="mt-5 flex flex-wrap gap-2">{category.tags.map((tag, index) => <span key={tag} className={cn("rounded-lg border px-3 py-1.5 text-sm font-bold", tagTone(index))}>{tag}</span>)}</div>
        </div>
        <StockIllustration type={category.image} title={category.title} />
      </div>
    </article>
  );
}

function MetricCard({ title, value, sub, icon, tone }: { title: string; value: string; sub: string; icon: string; tone: "blue" | "green" | "red" | "violet" }) {
  const tones = { blue: "from-blue-500/20 to-cyan-500/10 border-blue-300/20", green: "from-emerald-500/20 to-cyan-500/10 border-emerald-300/20", red: "from-rose-500/20 to-orange-500/10 border-rose-300/20", violet: "from-violet-500/20 to-blue-500/10 border-violet-300/20" };
  return (
    <article className={cn("nimbus-card-3d rounded-2xl border bg-gradient-to-br p-5", tones[tone])}>
      <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.08] text-xl">{icon}</span><div><p className="text-sm font-bold text-slate-300">{title}</p><p className="text-3xl font-extrabold text-white">{value}</p><p className="text-sm font-semibold text-slate-400">{sub}</p></div></div>
    </article>
  );
}

function HowToRead({ title = "How to Read" }: { title?: string }) {
  return (
    <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm font-semibold leading-7 text-slate-300">
        <p><span className="mr-2 text-emerald-300">●</span><b>Today</b> = ราคาล่าสุดของวันทำการปัจจุบัน</p>
        <p><span className="mr-2 text-blue-300">●</span><b>Prev Close</b> = ราคาปิดของวันทำการก่อนหน้า</p>
        <p><span className="mr-2 text-violet-300">●</span><b>After Hours</b> = ราคาหลังปิดตลาด อาจเป็น delayed</p>
      </div>
    </article>
  );
}

function TopMovers({ stocks, title = "Top Movers" }: { stocks: StockItem[]; title?: string }) {
  const rows = [...stocks].sort((a, b) => changePct(b.quote) - changePct(a.quote)).slice(0, 5);
  return (
    <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      <div className="mt-4 space-y-3">{rows.map((item, index) => <div key={item.ticker} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 text-sm font-bold"><span className="text-slate-400">{index + 1}</span><span className="text-white">{item.ticker}</span><span className="text-emerald-300">{signedPct(changePct(item.quote))}</span></div>)}</div>
    </article>
  );
}

function WhyWatch({ items }: { items: string[] }) {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">Why Watch</h2><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm font-semibold leading-7 text-slate-300"><span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-200">✓</span><span>{item}</span></li>)}</ul></article>;
}

function MarketSummary() {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">สรุปภาพรวมตลาด</h2><div className="mt-4 space-y-4">{marketIndexes.slice(1).map((item) => <MarketLine key={item.label} item={item} />)}</div></article>;
}

function MarketIndexCard({ item }: { item: (typeof marketIndexes)[number] }) {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><p className="font-bold text-slate-300">{item.label}</p><p className="mt-1 text-2xl font-extrabold text-white">{item.value}</p><span className={item.change >= 0 ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{signedPct(item.change)}</span><div className="mt-2 h-12"><Sparkline values={item.spark} violet={item.change < 0} /></div></article>;
}

function MarketLine({ item, mini = false }: { item: (typeof marketIndexes)[number]; mini?: boolean }) {
  return <div className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3"><div><p className={cn("font-bold text-white", mini && "text-xs")}>{item.label}</p><p className="text-xs text-slate-400">{item.value}</p></div><div className="h-8"><Sparkline values={item.spark} violet={item.change < 0} /></div><p className={item.change >= 0 ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{signedPct(item.change)}</p></div>;
}

function TradingSession() {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">ช่วงเวลาการซื้อขายของตลาดสหรัฐฯ</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{[["Pre-market", "04:00 - 09:30 ET"], ["Regular Hours", "09:30 - 16:00 ET"], ["After Hours", "16:00 - 20:00 ET"]].map(([name, time], index) => <div key={name} className={cn("rounded-2xl border p-5 text-center", index === 1 ? "border-emerald-300/45 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]")}><p className="text-lg font-extrabold text-white">{name}</p><p className="mt-1 text-slate-300">{time}</p></div>)}</div></article>;
}

function HeatTile({ item, big, fresh, stale }: { item: StockItem; big?: boolean; fresh?: boolean; stale?: boolean }) {
  const pct = changePct(item.quote);
  return <div className={cn("grid place-items-center rounded-lg border p-2 text-center", pct >= 0 ? "border-emerald-300/25 bg-emerald-500/20" : "border-rose-300/25 bg-rose-500/20", big && "md:col-span-2", fresh && "nimbus-live-new", stale && "nimbus-live-stale")}><div><p className="text-2xl font-extrabold text-white">{item.ticker}</p><p className={pct >= 0 ? "font-bold text-emerald-200" : "font-bold text-rose-200"}>{signedPct(pct)}</p></div></div>;
}

function StockIllustration({ type, title }: { type: Category["image"]; title: string }) {
  const label = { ai: "AI", chip: "CHIP", cloud: "CLOUD", fintech: "PAY", space: "ORBIT", health: "CARE", etf: "ETF", assets: "GOLD", growth: "GROW" }[type];
  return <div className="relative min-h-56 overflow-hidden rounded-2xl border border-blue-300/18 bg-slate-950/70"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(59,130,246,0.30),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(2,6,23,0.72))]" /><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.14)_1px,transparent_1px)] [background-size:34px_34px]" /><div className="absolute right-8 top-8 grid h-28 w-28 rotate-[-12deg] place-items-center rounded-3xl border border-cyan-300/30 bg-cyan-300/10"><span className="text-4xl font-black text-cyan-100">{label}</span></div><div className="absolute bottom-5 left-5 right-5"><p className="text-xs font-bold uppercase text-cyan-200/80">Research Theme</p><p className="text-2xl font-extrabold text-white">{title}</p></div></div>;
}

function LogoBadge({ item, small = false }: { item: StockItem; small?: boolean }) {
  return <span className={cn("grid shrink-0 place-items-center rounded-full border border-white/10 text-xs font-black text-white shadow-lg", small ? "h-8 w-8" : "h-11 w-11")} style={{ background: `linear-gradient(135deg, ${item.accent}, rgba(15,23,42,.86))` }}>{item.ticker.replace(".", "").slice(0, 2)}</span>;
}

function ViewBadge({ value, risk }: { value: number; risk: string }) {
  const tone = value > 0.8 ? "bg-emerald-400/15 text-emerald-200" : value < -0.4 ? "bg-amber-400/15 text-amber-200" : "bg-blue-400/15 text-blue-200";
  return <span className={cn("rounded-lg px-3 py-1.5 text-sm font-extrabold", tone)}>{risk === "สูง" || risk === "สูงมาก" ? "Volatile" : value >= 0 ? "Bullish" : "Watch"}</span>;
}

function Sparkline({ values, violet = false }: { values: number[]; violet?: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${34 - ((value - min) / span) * 28}`).join(" ");
  return <svg viewBox="0 0 100 40" className="h-full w-full" role="img" aria-label="trend sparkline"><polyline fill="none" stroke={violet ? "#a855f7" : "#22c55e"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={points} /></svg>;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm font-bold text-slate-400">{label}</p><p className="text-2xl font-extrabold text-white">{value}</p></div>;
}

function category(id: Category["id"], title: string, subtitle: string, icon: string, image: Category["image"], overviewTitle: string, overview: string, tags: string[], symbols: string[]): Category {
  const stocks = symbols.map((symbol) => makeStock(symbol, title));
  return { id, title, subtitle, icon, image, overviewTitle, overview, tags, why: defaultWhy(title), stocks };
}

function makeStock(ticker: string, categoryName: string): StockItem {
  const quote = seedQuotes[ticker] ?? q(ticker, 100, 99, 100.5, "-", "-");
  const meta: Record<string, Partial<StockItem>> = {
    NVDA: { name: "NVIDIA Corporation", theme: "AI / Chip", thesis: "ผู้นำ GPU / AI Data Center", strength: "ecosystem แข็งแกร่ง", risk: "ปานกลาง", tags: ["AI", "Chip"], accent: "#76ff7a", spark: [12, 18, 22, 31, 27, 39, 44] },
    MSFT: { name: "Microsoft Corporation", theme: "Cloud", thesis: "Cloud + AI + Enterprise", strength: "ฐานลูกค้าองค์กรใหญ่", risk: "ต่ำ", tags: ["AI", "Cloud"], accent: "#41a5ff", spark: [18, 21, 24, 26, 31, 35, 38] },
    GOOGL: { name: "Alphabet Inc.", theme: "Search / Cloud", thesis: "Search, YouTube, Cloud, AI", strength: "โฆษณาและ AI", risk: "ปานกลาง", tags: ["AI", "Cloud"], accent: "#fbbc04", spark: [15, 17, 20, 19, 25, 29, 34] },
    AMZN: { name: "Amazon.com, Inc.", theme: "AWS / Commerce", thesis: "AWS + E-commerce + AI", strength: "AWS แข็งแรง", risk: "ปานกลาง", tags: ["Cloud"], accent: "#ff9900", spark: [11, 14, 18, 21, 24, 30, 35] },
    META: { name: "Meta Platforms, Inc.", theme: "AI / Social", thesis: "Ads + AI + cash flow", strength: "รายได้โฆษณา", risk: "สูง", tags: ["AI", "Social"], accent: "#66a7ff", spark: [13, 19, 17, 24, 29, 34, 37] },
    AVGO: { name: "Broadcom Inc.", theme: "AI ASIC", thesis: "ชิป AI / Network / VMware", strength: "custom chip", risk: "สูง", tags: ["Chip"], accent: "#e31b54", spark: [16, 22, 21, 29, 33, 39, 45] },
    AMD: { name: "Advanced Micro Devices", theme: "GPU / CPU", thesis: "ทางเลือก GPU/CPU AI", strength: "CPU + GPU cycle", risk: "สูง", tags: ["Chip"], accent: "#ed1c24", spark: [10, 14, 19, 16, 22, 26, 33] },
    TSM: { name: "Taiwan Semiconductor", theme: "Foundry", thesis: "โรงงานผลิตชิประดับโลก", strength: "foundry ระดับโลก", risk: "ปานกลาง", tags: ["Chip"], accent: "#f15a24", spark: [18, 20, 24, 28, 31, 33, 40] },
    CRWD: { name: "CrowdStrike Holdings", theme: "Cybersecurity", thesis: "Cybersecurity ระดับองค์กร", strength: "endpoint platform", risk: "สูง", tags: ["Cyber"], accent: "#e11d48", spark: [42, 36, 31, 25, 28, 20, 18] },
    RKLB: { name: "Rocket Lab USA, Inc.", theme: "Space", thesis: "Launch / satellite", strength: "space systems growth", risk: "สูงมาก", tags: ["Space"], accent: "#111827", spark: [5, 7, 9, 15, 18, 21, 29] },
  };
  const fallback = { name: ticker, theme: categoryName, thesis: categoryName, strength: "ติดตามธีมระยะยาว", risk: "ปานกลาง", tags: [categoryName.split(" ")[0]], accent: "#3b82f6", spark: [10, 13, 12, 16, 20, 22, 25] };
  const detail = { ...fallback, ...meta[ticker] };
  return {
    ticker,
    yahoo: ticker === "BRK.B" ? "BRK-B" : ticker === "BTC" ? "BTC-USD" : ticker === "ETH" ? "ETH-USD" : undefined,
    category: categoryName,
    quote,
    name: detail.name ?? fallback.name,
    theme: detail.theme ?? fallback.theme,
    thesis: detail.thesis ?? fallback.thesis,
    strength: detail.strength ?? fallback.strength,
    risk: detail.risk ?? fallback.risk,
    tags: detail.tags ?? fallback.tags,
    accent: detail.accent ?? fallback.accent,
    spark: detail.spark ?? fallback.spark,
  };
}

function q(symbol: string, price: number, prevClose: number, afterHours: number, marketCap: string, volume: string): Quote {
  return { symbol, price, prevClose, afterHours, marketCap, volume };
}

function defaultWhy(title: string) {
  return [`${title} เป็นธีมที่ควรติดตามในพอร์ตระยะยาว`, "มีทั้งโอกาสเติบโตและความเสี่ยงเฉพาะกลุ่ม", "เหมาะสำหรับดูประกอบการศึกษา ไม่ใช่สัญญาณซื้อขาย"];
}

const marketIndexes = [
  { label: "NYSE", value: "16,845.35", change: 0.42, spark: [12, 15, 18, 17, 21, 24, 28] },
  { label: "NASDAQ", value: "16,920.79", change: 0.8, spark: [10, 14, 18, 20, 19, 25, 31] },
  { label: "S&P 500", value: "5,301.40", change: 0.45, spark: [14, 15, 18, 16, 22, 25, 29] },
  { label: "DOW JONES", value: "39,872.39", change: 0.35, spark: [11, 13, 14, 17, 21, 23, 26] },
  { label: "VIX", value: "12.68", change: -1.02, spark: [28, 27, 23, 22, 18, 16, 12] },
];

function tagTone(index: number) {
  const tones = ["border-violet-300/25 bg-violet-400/12 text-violet-200", "border-blue-300/25 bg-blue-400/12 text-blue-200", "border-cyan-300/25 bg-cyan-400/12 text-cyan-200", "border-emerald-300/25 bg-emerald-400/12 text-emerald-200", "border-amber-300/25 bg-amber-400/12 text-amber-200"];
  return tones[index % tones.length];
}

function change(quote: Quote) {
  return quote.price - quote.prevClose;
}

function changePct(quote: Quote) {
  return quote.prevClose ? ((quote.price - quote.prevClose) / quote.prevClose) * 100 : 0;
}

function afterChange(quote: Quote) {
  return quote.afterHours - quote.price;
}

function afterChangePct(quote: Quote) {
  return quote.price ? ((quote.afterHours - quote.price) / quote.price) * 100 : 0;
}

function getMarketStateCopy(state?: string) {
  const normalized = state?.toUpperCase();
  if (normalized === "REGULAR") return { label: "กำลังซื้อขาย", shortLabel: "LIVE", className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" };
  if (normalized === "PRE" || normalized === "PREPRE") return { label: "ก่อนเปิดตลาด", shortLabel: "PRE-MARKET", className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" };
  if (normalized === "POST" || normalized === "POSTPOST") return { label: "หลังตลาดปิด", shortLabel: "AFTER HOURS", className: "border-violet-300/30 bg-violet-300/10 text-violet-100" };
  if (normalized === "CLOSED") return { label: "ตลาดปิด", shortLabel: "CLOSED", className: "border-slate-300/20 bg-white/[0.06] text-slate-200" };
  return { label: "สถานะตลาดไม่พร้อมใช้งาน", shortLabel: "UNAVAILABLE", className: "border-amber-300/25 bg-amber-300/10 text-amber-100" };
}

function formatPrice(value: number) {
  return value >= 1000 ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function signedPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
