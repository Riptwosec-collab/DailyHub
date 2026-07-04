"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ViewId = "overview" | "market" | "alerts" | "heatmap" | "watchlist" | "portfolio" | "category";

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
  image: "ai" | "chip" | "cloud" | "fintech" | "space" | "health" | "etf" | "assets" | "portfolio" | "growth";
  overviewTitle: string;
  overview: string;
  tags: string[];
  why: string[];
  watchlist: string[];
  stocks: StockItem[];
};

type QuoteApiItem = Partial<Quote> & { symbol?: string };

type PortfolioHolding = {
  ticker: string;
  name: string;
  type: string;
  current: number;
  target: number;
  dayChange: string;
  contribution: number;
  value: number;
};

const portfolioStorageKey = "nimbusdaily-portfolio-holdings";

const defaultPortfolioHoldings: PortfolioHolding[] = [
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", type: "Core ETF", current: 18, target: 18, dayChange: "+0.42%", contribution: 102.34, value: 441054 },
  { ticker: "QQQ", name: "Invesco QQQ Trust", type: "Core ETF", current: 10, target: 10, dayChange: "+0.68%", contribution: 76.45, value: 245032 },
  { ticker: "XLK", name: "Technology Select Sector", type: "Growth Tech", current: 12, target: 12, dayChange: "+0.75%", contribution: 88.21, value: 294008 },
  { ticker: "NVDA", name: "NVIDIA Corporation", type: "Growth Tech", current: 8, target: 6, dayChange: "+1.15%", contribution: 61.77, value: 196025 },
  { ticker: "GLD", name: "SPDR Gold Shares", type: "Gold", current: 10, target: 10, dayChange: "+0.21%", contribution: 21.45, value: 245032 },
  { ticker: "BTC-USD", name: "Bitcoin", type: "Crypto", current: 8, target: 8, dayChange: "+2.34%", contribution: 58.93, value: 196025 },
  { ticker: "BND", name: "Vanguard Bond Market ETF", type: "Bonds", current: 10, target: 12, dayChange: "+0.12%", contribution: 12.34, value: 245032 },
  { ticker: "CASH", name: "USD Cash", type: "Cash", current: 7, target: 8, dayChange: "0.00%", contribution: 0, value: 171101 },
];

const navItems: { id: ViewId; title: string; icon: string }[] = [
  { id: "overview", title: "Stock Overview", icon: "↗" },
  { id: "market", title: "สถานะตลาด", icon: "●" },
  { id: "alerts", title: "แจ้งเตือนราคา", icon: "◔" },
  { id: "heatmap", title: "Heatmap", icon: "▦" },
  { id: "watchlist", title: "Watchlist", icon: "★" },
  { id: "portfolio", title: "Portfolio Allocation", icon: "◎" },
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

export function StocksHubView() {
  const [view, setView] = useState<ViewId>("overview");
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);
  const [query, setQuery] = useState("");
  const [liveQuotes, setLiveQuotes] = useState<Record<string, Quote>>({});
  const [lastUpdated, setLastUpdated] = useState("ใช้ fallback sample");

  useEffect(() => {
    const controller = new AbortController();
    const symbols = uniqueStocks.map((item) => item.yahoo ?? item.ticker).join(",");
    fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(symbols)}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("quote api failed"))))
      .then((payload: { quotes?: QuoteApiItem[]; updatedAt?: string }) => {
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
        if (Object.keys(nextQuotes).length > 0) {
          setLiveQuotes(nextQuotes);
          setLastUpdated(payload.updatedAt ? new Date(payload.updatedAt).toLocaleString("th-TH") : new Date().toLocaleString("th-TH"));
        }
      })
      .catch(() => {
        setLastUpdated("ใช้ fallback sample");
      });
    return () => controller.abort();
  }, []);

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

  return (
    <section className="stock-hub w-full text-slate-100">
      <div className="grid gap-5 2xl:grid-cols-[15.5rem_minmax(0,1fr)]">
        <StockSidebar view={view} activeCategoryId={activeCategoryId} onView={setView} onCategory={(id) => { setActiveCategoryId(id); setView("category"); }} />
        <div className="min-w-0 space-y-5">
          <StockTopbar view={view} category={activeCategory} query={query} setQuery={setQuery} lastUpdated={lastUpdated} />
          {view === "overview" && <OverviewBoard stocks={filteredAll} setView={setView} setCategory={setActiveCategoryId} />}
          {view === "market" && <MarketStatus lastUpdated={lastUpdated} />}
          {view === "alerts" && <PriceAlerts stocks={hydratedStocks.slice(0, 8)} />}
          {view === "heatmap" && <Heatmap stocks={hydratedStocks} />}
          {view === "watchlist" && <WatchlistPage stocks={hydratedStocks.slice(0, 10)} />}
          {view === "portfolio" && <PortfolioAllocation />}
          {view === "category" && <CategoryResearch category={activeCategory} stocks={activeStocks} />}
          <footer className="stock-footer rounded-2xl border border-white/10 bg-slate-950/45 px-5 py-4 text-center text-sm font-medium text-slate-400">
            ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน ราคาจาก API อาจล่าช้าหรือใช้ fallback เมื่อแหล่งข้อมูลไม่ตอบสนอง
          </footer>
        </div>
      </div>
    </section>
  );
}

function StockSidebar({ view, activeCategoryId, onView, onCategory }: { view: ViewId; activeCategoryId: string; onView: (id: ViewId) => void; onCategory: (id: string) => void }) {
  return (
    <aside className="nimbus-card-3d sticky top-24 hidden h-[calc(100vh-7rem)] rounded-2xl border border-white/10 bg-slate-950/72 p-4 2xl:block">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-2xl font-black shadow-[0_0_34px_rgba(59,130,246,0.35)]">N</div>
        <div>
          <p className="text-lg font-extrabold leading-none text-white">NEXUS</p>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Research</p>
        </div>
      </div>
      <nav className="max-h-[calc(100vh-18rem)] space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => (
          <button key={item.id} type="button" onClick={() => onView(item.id)} className={navButton(view === item.id)}>
            <span className="w-7 text-center text-base">{item.icon}</span>
            <span>{item.title}</span>
          </button>
        ))}
        <div className="my-3 border-t border-white/10" />
        {categories.map((category) => (
          <button key={category.id} type="button" onClick={() => onCategory(category.id)} className={navButton(view === "category" && activeCategoryId === category.id)}>
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px]">{category.icon}</span>
            <span>{category.title}</span>
          </button>
        ))}
      </nav>
      <MarketMiniCard />
    </aside>
  );
}

function StockTopbar({ view, category, query, setQuery, lastUpdated }: { view: ViewId; category: Category; query: string; setQuery: (value: string) => void; lastUpdated: string }) {
  const titleMap: Record<ViewId, string> = {
    overview: "หน้ารวมหุ้น",
    market: "สถานะตลาดและเวลาอัปเดต",
    alerts: "แจ้งเตือนราคา",
    heatmap: "Heatmap ตลาดหุ้น",
    watchlist: "รายการติดตามหลายชุด",
    portfolio: "จัดสรรพอร์ตการลงทุน",
    category: category.title,
  };
  return (
    <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div>
        <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">{titleMap[view]}</h1>
        <p className="mt-2 text-lg font-medium text-slate-300">{view === "category" ? category.subtitle : "ภาพรวมตลาด หุ้นเด่น Watchlist พอร์ต และราคาหลังตลาดปิดในหน้าเดียว"}</p>
        <label className="relative mt-4 block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/55 pl-12 pr-4 text-base font-semibold text-white shadow-inner shadow-black/20 transition focus:border-cyan-300/45" placeholder="ค้นหาหุ้น, Ticker, หรือหมวดหมู่..." />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-400">ตลาดสหรัฐ</p>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-extrabold text-emerald-200">เปิดทำการ</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white">Real-time / Delayed</p>
          <p className="text-sm font-semibold text-slate-400">อัปเดตล่าสุด: {lastUpdated}</p>
        </div>
      </div>
    </header>
  );
}

function OverviewBoard({ stocks, setView, setCategory }: { stocks: StockItem[]; setView: (view: ViewId) => void; setCategory: (id: string) => void }) {
  const gainers = stocks.filter((item) => change(item.quote) >= 0);
  const losers = stocks.length - gainers.length;
  const afterMovers = stocks.filter((item) => afterChange(item.quote) !== 0).length;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="จำนวนหุ้นที่ติดตาม" value={stocks.length.toString()} sub="รวมทุกหมวด" icon="☆" tone="blue" />
        <MetricCard title="หุ้นบวกวันนี้" value={gainers.length.toString()} sub={`${Math.round((gainers.length / stocks.length) * 100)}% ของทั้งหมด`} icon="↗" tone="green" />
        <MetricCard title="หุ้นลบวันนี้" value={losers.toString()} sub={`${Math.round((losers / stocks.length) * 100)}% ของทั้งหมด`} icon="↘" tone="red" />
        <MetricCard title="After Hours เด่น" value={afterMovers.toString()} sub="มีราคาเปลี่ยนแปลง" icon="☾" tone="violet" />
      </div>
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setView("overview")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white">All</button>
        {categories.slice(0, 6).map((category) => (
          <button key={category.id} type="button" onClick={() => { setCategory(category.id); setView("category"); }} className="rounded-xl border border-white/10 bg-slate-950/55 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-white">{category.title}</button>
        ))}
        <button type="button" onClick={() => setView("heatmap")} className="ml-auto rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-2.5 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15">Heatmap</button>
        <button type="button" onClick={() => setView("watchlist")} className="rounded-xl border border-white/10 bg-slate-950/55 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-white">Watchlist</button>
      </div>
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <PriceTable title="Stock Overview Board" stocks={stocks.slice(0, 18)} compact={false} />
        <aside className="space-y-5">
          <HowToRead />
          <TopMovers stocks={stocks} />
          <MiniWatchlist stocks={stocks.slice(0, 6)} />
        </aside>
      </div>
    </div>
  );
}

function CategoryResearch({ category, stocks }: { category: Category; stocks: StockItem[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <main className="min-w-0 space-y-5">
        <OverviewPanel category={category} />
        <PriceTable title={`หุ้นในหมวด ${category.title}`} stocks={stocks} compact={false} />
      </main>
      <aside className="space-y-5">
        <WhyWatch items={category.why} />
        <MiniWatchlist stocks={stocks.slice(0, 8)} />
        <MarketSummary />
      </aside>
    </div>
  );
}

function PriceTable({ title, stocks, compact }: { title: string; stocks: StockItem[]; compact: boolean }) {
  return (
    <article className="nimbus-card-3d overflow-hidden rounded-2xl border border-white/10 bg-slate-950/62">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
        <span className="text-sm font-bold text-slate-400">Today / Prev Close / After Hours</span>
      </div>
      <div className="overflow-x-auto">
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
                <tr key={`${item.ticker}-${title}`} className="border-t border-white/8 transition hover:bg-white/[0.04]">
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
    </article>
  );
}

function MarketStatus({ lastUpdated }: { lastUpdated: string }) {
  return (
    <div className="space-y-5">
      <article className="nimbus-card-3d grid gap-6 rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-950/70 to-slate-950 p-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex items-center gap-6">
          <div className="relative grid h-44 w-44 place-items-center rounded-full border border-emerald-300/30 bg-emerald-400/10">
            <span className="absolute h-28 w-28 rounded-full border border-emerald-300/45" />
            <span className="absolute h-16 w-16 rounded-full border border-emerald-300/45" />
            <span className="h-5 w-5 rounded-full bg-emerald-300 shadow-[0_0_28px_rgba(52,211,153,.7)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-300">ตลาดสหรัฐ:</p>
            <p className="mt-2 text-6xl font-extrabold text-emerald-300">เปิดทำการ</p>
            <span className="mt-3 inline-flex rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-extrabold text-emerald-200">LIVE</span>
          </div>
        </div>
        <div className="space-y-5 border-white/10 lg:border-l lg:pl-8">
          <InfoLine label="อัปเดตล่าสุด" value={lastUpdated} />
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

function PriceAlerts({ stocks }: { stocks: StockItem[] }) {
  const rows = stocks.slice(0, 4);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <main className="space-y-5">
        <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
          <h2 className="text-xl font-extrabold text-white">สร้างการแจ้งเตือนใหม่</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {["Ticker: NVDA", "Condition: Above", "Price Target: 950.00 USD", "Repeat: Once", "Time: 09:30 - 16:00 ET", "Telegram: @nexus_alerts"].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-200">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {["Telegram", "Email", "In-app", "Push"].map((item, index) => <button key={item} type="button" className={cn("rounded-xl border px-5 py-2.5 text-sm font-extrabold", index === 0 ? "border-blue-300/40 bg-blue-600 text-white" : "border-white/10 bg-white/[0.04] text-slate-300")}>{item}</button>)}
          </div>
        </article>
        <PriceTable title="รายการแจ้งเตือนของฉัน" stocks={rows} compact />
      </main>
      <aside className="space-y-5">
        <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
          <h2 className="text-xl font-extrabold text-white">การเชื่อมต่อ Telegram</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-sky-500 text-3xl">✈</div>
            <div><p className="font-extrabold text-emerald-300">เชื่อมต่อแล้ว</p><p className="text-sm text-slate-400">@NimbusDailyBot</p></div>
          </div>
          <button type="button" className="mt-5 w-full rounded-xl border border-sky-300/30 bg-sky-500/10 px-4 py-3 font-extrabold text-sky-200">ทดสอบการแจ้งเตือน</button>
        </article>
        <MiniWatchlist stocks={rows} title="กิจกรรมแจ้งเตือนล่าสุด" />
      </aside>
    </div>
  );
}

function Heatmap({ stocks }: { stocks: StockItem[] }) {
  const groups = [
    ["เทคโนโลยี", stocks.filter((item) => ["AI / Mega Cap", "Semiconductor", "Cloud / Cybersecurity"].includes(item.category)).slice(0, 12)],
    ["บริการผู้บริโภค", stocks.filter((item) => ["AMZN", "META", "MCD", "COST"].includes(item.ticker))],
    ["เฮลธ์แคร์", stocks.filter((item) => item.category.includes("Healthcare")).slice(0, 5)],
    ["ETF / ดัชนี", stocks.filter((item) => item.category === "ETF").slice(0, 6)],
    ["สินทรัพย์ทางเลือก", stocks.filter((item) => item.category === "Alternative Assets").slice(0, 4)],
  ] as const;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <main className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {["Heatmap", "S&P 500", "Watchlist", "AI Theme", "Semiconductor", "ETF Heatmap"].map((item, index) => <span key={item} className={cn("rounded-xl px-4 py-2 text-sm font-extrabold", index === 0 ? "bg-blue-600 text-white" : "border border-white/10 bg-white/[0.04] text-slate-300")}>{item}</span>)}
        </div>
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_.9fr]">
          {groups.map(([title, items]) => (
            <section key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
              <h3 className="mb-2 font-extrabold text-white">{title}</h3>
              <div className="grid auto-rows-[5.5rem] grid-cols-2 gap-2 md:grid-cols-3">
                {items.map((item, index) => <HeatTile key={item.ticker} item={item} big={index < 2} />)}
              </div>
            </section>
          ))}
        </div>
      </main>
      <aside className="space-y-5">
        <TopMovers stocks={stocks} title="Top Positive Sectors" />
        <HowToRead title="How to Read Heatmap" />
      </aside>
    </div>
  );
}

function WatchlistPage({ stocks }: { stocks: StockItem[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <main className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {["AI Watchlist", "High Growth", "Safe Long-term", "Space", "ETF Core", "Crypto"].map((item, index) => (
            <button key={item} type="button" className={cn("nimbus-card-3d rounded-2xl border px-4 py-4 text-left", index === 0 ? "border-blue-300/50 bg-blue-500/15" : "border-white/10 bg-slate-950/55")}>
              <p className="font-extrabold text-white">{item}</p>
              <p className="text-sm text-slate-400">{15 + index * 3} รายการ</p>
            </button>
          ))}
        </div>
        <PriceTable title="AI Watchlist" stocks={stocks} compact />
      </main>
      <aside className="space-y-5">
        <MiniWatchlist stocks={stocks.slice(0, 6)} title="รายการโปรด" />
        <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
          <h2 className="text-xl font-extrabold text-white">การดำเนินการด่วน</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["สร้าง Watchlist", "นำเข้ารายการ", "แชร์ Watchlist", "ตั้งแจ้งเตือน"].map((item) => <button key={item} type="button" className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-slate-300">{item}</button>)}
          </div>
        </article>
      </aside>
    </div>
  );
}

function PortfolioAllocation() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(defaultPortfolioHoldings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(portfolioStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as PortfolioHolding[];
        if (Array.isArray(parsed) && parsed.length > 0) setHoldings(parsed);
      }
    } catch {
      setHoldings(defaultPortfolioHoldings);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(portfolioStorageKey, JSON.stringify(holdings));
  }, [holdings, loaded]);

  const totalValue = holdings.reduce((sum, item) => sum + item.value, 0);
  const totalCurrent = holdings.reduce((sum, item) => sum + item.current, 0);
  const totalTarget = holdings.reduce((sum, item) => sum + item.target, 0);
  const drift = holdings.reduce((sum, item) => sum + Math.abs(item.current - item.target), 0) / Math.max(holdings.length, 1);
  const riskScore = Math.min(9.9, Math.max(1, drift + holdings.filter((item) => ["Growth Tech", "Crypto"].includes(item.type)).length * 0.55 + 2.4));
  const conicStops = holdings.reduce<{ start: number; stops: string[] }>(
    (state, item, index) => {
      const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f97316", "#fbbf24", "#22c55e", "#94a3b8", "#f43f5e", "#14b8a6"];
      const end = state.start + Math.max(item.current, 0);
      state.stops.push(`${colors[index % colors.length]} ${state.start}% ${end}%`);
      state.start = end;
      return state;
    },
    { start: 0, stops: [] },
  ).stops.join(",");

  const updateHolding = (ticker: string, field: keyof PortfolioHolding, value: string) => {
    setHoldings((current) =>
      current.map((item) => {
        if (item.ticker !== ticker) return item;
        if (field === "current" || field === "target" || field === "value") return { ...item, [field]: Math.max(0, Number(value) || 0) };
        if (field === "contribution") return { ...item, contribution: Number(value) || 0 };
        return { ...item, [field]: value };
      }),
    );
  };

  const addHolding = () => {
    const id = `NEW-${holdings.length + 1}`;
    setHoldings((current) => [
      ...current,
      { ticker: id, name: "New Holding", type: "Custom", current: 0, target: 0, dayChange: "0.00%", contribution: 0, value: 0 },
    ]);
  };

  const removeHolding = (ticker: string) => setHoldings((current) => current.filter((item) => item.ticker !== ticker));

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_28rem]">
      <main className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,.85fr))]">
          <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5 xl:row-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">ภาพรวมพอร์ตปัจจุบัน</h2>
                <p className="mt-1 text-sm font-semibold text-slate-400">แก้ไขน้ำหนักและมูลค่าได้เอง ระบบจะจำค่าไว้ในเครื่องนี้</p>
              </div>
              <button type="button" onClick={() => setHoldings(defaultPortfolioHoldings)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07]">
                รีเซ็ต
              </button>
            </div>
            <div className="mt-6 grid place-items-center">
              <div className="grid h-52 w-52 place-items-center rounded-full" style={{ background: `conic-gradient(${conicStops || "#334155 0% 100%"})` }}>
                <div className="grid h-32 w-32 place-items-center rounded-full bg-slate-950 text-center">
                  <span className="text-sm text-slate-400">มูลค่ารวม</span>
                  <strong className="text-2xl text-white">{Math.round(totalValue).toLocaleString("en-US")}</strong>
                  <span className="text-xs text-slate-400">USD</span>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-bold">
              <span className="rounded-xl bg-white/[0.04] px-3 py-2 text-slate-300">ปัจจุบัน {totalCurrent.toFixed(1)}%</span>
              <span className="rounded-xl bg-white/[0.04] px-3 py-2 text-slate-300">เป้าหมาย {totalTarget.toFixed(1)}%</span>
            </div>
          </article>
          <MetricCard title="Risk Score" value={`${riskScore.toFixed(1)} / 10`} sub={riskScore > 6 ? "สูง" : "ปานกลาง"} icon="↻" tone="blue" />
          <MetricCard title="สถานะ Rebalance" value={drift > 1.2 ? "ควรปรับ" : "สมดุล"} sub={`เบี่ยงเบน ${drift.toFixed(1)}%`} icon="↺" tone="green" />
          <MetricCard title="จำนวนสินทรัพย์" value={holdings.length.toString()} sub="แก้ไขได้เอง" icon="◎" tone="violet" />
          {["Conservative", "Growth", "Aggressive", "Custom Portfolio"].map((item) => (
            <button key={item} type="button" className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5 text-left transition hover:border-cyan-300/25">
              <p className="font-extrabold text-white">{item}</p>
              <p className="mt-2 text-sm text-slate-400">โมเดลพอร์ตพร้อมใช้ ปรับน้ำหนักต่อได้เอง</p>
            </button>
          ))}
        </div>
        <article className="nimbus-card-3d overflow-hidden rounded-2xl border border-white/10 bg-slate-950/62">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">การถือครองตามพอร์ตปัจจุบัน</h2>
              <p className="text-sm font-semibold text-slate-400">แก้ไขช่อง current / target / value ได้ทันที</p>
            </div>
            <button type="button" onClick={addHolding} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-500">
              + เพิ่มสินทรัพย์
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ticker</th>
                  <th className="px-4 py-3">ชื่อ / สินทรัพย์</th>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">ปัจจุบัน %</th>
                  <th className="px-4 py-3">เป้าหมาย %</th>
                  <th className="px-4 py-3">เปลี่ยนวันนี้</th>
                  <th className="px-4 py-3">Contribution</th>
                  <th className="px-4 py-3">มูลค่า USD</th>
                  <th className="px-4 py-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((row) => (
                  <tr key={row.ticker} className="border-t border-white/8 transition hover:bg-white/[0.04]">
                    <td className="px-4 py-3">
                      <input className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-extrabold text-white" value={row.ticker} onChange={(event) => updateHolding(row.ticker, "ticker", event.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-60 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-200" value={row.name} onChange={(event) => updateHolding(row.ticker, "name", event.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="w-36 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-300" value={row.type} onChange={(event) => updateHolding(row.ticker, "type", event.target.value)} />
                    </td>
                    <td className="px-4 py-3"><NumberInput value={row.current} onChange={(value) => updateHolding(row.ticker, "current", value)} /></td>
                    <td className="px-4 py-3"><NumberInput value={row.target} onChange={(value) => updateHolding(row.ticker, "target", value)} /></td>
                    <td className="px-4 py-3">
                      <input className="w-28 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-bold text-emerald-300" value={row.dayChange} onChange={(event) => updateHolding(row.ticker, "dayChange", event.target.value)} />
                    </td>
                    <td className="px-4 py-3"><NumberInput value={row.contribution} onChange={(value) => updateHolding(row.ticker, "contribution", value)} /></td>
                    <td className="px-4 py-3"><NumberInput value={row.value} onChange={(value) => updateHolding(row.ticker, "value", value)} wide /></td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeHolding(row.ticker)} className="rounded-lg border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-extrabold text-rose-200">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </main>
      <aside className="space-y-5">
        <RebalanceBox holdings={holdings} totalValue={totalValue} />
        <GoalBox />
      </aside>
    </div>
  );
}

function NumberInput({ value, onChange, wide = false }: { value: number; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn("rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-bold text-white", wide ? "w-32" : "w-24")}
    />
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

function MiniWatchlist({ stocks, title = "รายการที่ติดตาม" }: { stocks: StockItem[]; title?: string }) {
  return (
    <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
      <h2 className="text-xl font-extrabold text-white">{title}</h2>
      <div className="mt-4 space-y-3">{stocks.map((item) => <div key={`${title}-${item.ticker}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2"><div className="flex items-center gap-2"><LogoBadge item={item} small /><span className="font-bold text-white">{item.ticker}</span></div><span className={change(item.quote) >= 0 ? "font-bold text-emerald-300" : "font-bold text-rose-300"}>{formatPrice(item.quote.price)}</span></div>)}</div>
    </article>
  );
}

function WhyWatch({ items }: { items: string[] }) {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">Why Watch</h2><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm font-semibold leading-7 text-slate-300"><span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-200">✓</span><span>{item}</span></li>)}</ul></article>;
}

function MarketSummary() {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">สรุปภาพรวมตลาด</h2><div className="mt-4 space-y-4">{marketIndexes.slice(1).map((item) => <MarketLine key={item.label} item={item} />)}</div></article>;
}

function MarketMiniCard() {
  return <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4"><p className="font-bold text-white">ตลาดวันนี้</p><p className="text-sm font-semibold text-emerald-300">● เปิดทำการ</p><div className="mt-3 space-y-2">{marketIndexes.slice(1, 4).map((item) => <MarketLine key={item.label} item={item} mini />)}</div></div>;
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

function HeatTile({ item, big }: { item: StockItem; big?: boolean }) {
  const pct = changePct(item.quote);
  return <div className={cn("grid place-items-center rounded-lg border p-2 text-center", pct >= 0 ? "border-emerald-300/25 bg-emerald-500/20" : "border-rose-300/25 bg-rose-500/20", big && "md:col-span-2")}><div><p className="text-2xl font-extrabold text-white">{item.ticker}</p><p className={pct >= 0 ? "font-bold text-emerald-200" : "font-bold text-rose-200"}>{signedPct(pct)}</p></div></div>;
}

function RebalanceBox({ holdings, totalValue }: { holdings: PortfolioHolding[]; totalValue: number }) {
  const suggestions = holdings
    .map((item) => {
      const diff = item.target - item.current;
      return {
        ticker: item.ticker,
        action: diff >= 0 ? "เพิ่มน้ำหนัก" : "ลดน้ำหนัก",
        amount: Math.round((Math.abs(diff) / 100) * totalValue),
        diff,
      };
    })
    .filter((item) => Math.abs(item.diff) >= 1)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 4);

  return (
    <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5">
      <h2 className="text-xl font-extrabold text-white">ข้อเสนอแนะ Rebalance</h2>
      <p className="mt-1 text-sm font-semibold text-slate-400">คำนวณจากน้ำหนักปัจจุบันและเป้าหมายที่แก้เอง</p>
      <div className="mt-4 space-y-3">
        {(suggestions.length > 0 ? suggestions : [{ ticker: "Portfolio", action: "สมดุลแล้ว", amount: 0, diff: 0 }]).map((item) => (
          <div key={item.ticker} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-white/[0.035] px-3 py-2 text-sm font-bold">
            <span className={item.diff < 0 ? "text-rose-300" : "text-emerald-300"}>{item.action}</span>
            <span className="text-white">{item.ticker} {item.amount > 0 ? `${item.amount.toLocaleString("en-US")} USD` : ""}</span>
          </div>
        ))}
      </div>
      <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-extrabold text-white transition hover:bg-blue-500" type="button">
        ใช้เป็นแผนปรับพอร์ต
      </button>
    </article>
  );
}

function GoalBox() {
  return <article className="nimbus-card-3d rounded-2xl border border-white/10 bg-slate-950/62 p-5"><h2 className="text-xl font-extrabold text-white">เป้าหมายการลงทุน</h2><div className="mt-4 space-y-4">{[["Long-term Growth", 82], ["Income", 64], ["Capital Preservation", 91]].map(([label, value]) => <div key={label as string}><div className="flex justify-between text-sm font-bold"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-500" style={{ width: `${value}%` }} /></div></div>)}</div></article>;
}

function StockIllustration({ type, title }: { type: Category["image"]; title: string }) {
  const label = { ai: "AI", chip: "CHIP", cloud: "CLOUD", fintech: "PAY", space: "ORBIT", health: "CARE", etf: "ETF", assets: "GOLD", portfolio: "ALLOC", growth: "GROW" }[type];
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
  return { id, title, subtitle, icon, image, overviewTitle, overview, tags, why: defaultWhy(title), watchlist: symbols, stocks };
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

function navButton(active: boolean) {
  return cn("flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition", active ? "border-blue-300/35 bg-blue-600/35 text-white" : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white");
}

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

function formatPrice(value: number) {
  return value >= 1000 ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function signedPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
