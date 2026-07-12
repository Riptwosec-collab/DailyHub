"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { ThemeToggle } from "./ThemeToggle";

type UpdateCopy = {
  updatedAt: string;
  th: string;
  en: string;
};

type NavItem = {
  href: string;
  icon: string;
  key?: TranslationKey;
  th?: string;
  en?: string;
  update: UpdateCopy;
};

type ManualUpdateEntry = {
  updatedAt: string;
  count: number;
  newItems?: number;
  expiredItems?: number;
  itemIds?: string[];
  status?: "success" | "error";
  th?: string;
  en?: string;
};

type ManualUpdateState = Record<string, ManualUpdateEntry>;

const UPDATE_STORAGE_KEY = "nimbusdaily-menu-updates";
const REFRESH_SNAPSHOT_STORAGE_KEY = "nimbusdaily-menu-refresh-snapshots";

function getNewItemIds(href: string, itemIds: string[]) {
  if (typeof window === "undefined") return [];

  try {
    const snapshots = JSON.parse(window.localStorage.getItem(REFRESH_SNAPSHOT_STORAGE_KEY) ?? "{}") as Record<string, string[]>;
    const previous = snapshots[href] ?? [];
    const newItems = previous.length === 0 ? itemIds : itemIds.filter((item) => !previous.includes(item));
    window.localStorage.setItem(REFRESH_SNAPSHOT_STORAGE_KEY, JSON.stringify({ ...snapshots, [href]: itemIds }));
    return newItems;
  } catch {
    return itemIds;
  }
}

function countNewItems(href: string, itemIds: string[]) {
  return getNewItemIds(href, itemIds).length;
}

function newItemText(newItems: number, expiredItems = 0) {
  return {
    th: `เพิ่มใหม่ ${newItems} รายการ${expiredItems ? ` · ตัดรายการหมดอายุ ${expiredItems} รายการ` : ""}`,
    en: `${newItems} new item${newItems === 1 ? "" : "s"}${expiredItems ? ` · removed ${expiredItems} expired` : ""}`,
  };
}
const STOCK_REFRESH_SYMBOLS = [
  "NVDA",
  "MSFT",
  "GOOGL",
  "AMZN",
  "META",
  "AVGO",
  "AMD",
  "TSM",
  "ASML",
  "MU",
  "QCOM",
  "CRWD",
  "PANW",
  "NET",
  "DDOG",
  "SNOW",
  "V",
  "MA",
  "HOOD",
  "SOFI",
  "RKLB",
  "LMT",
  "GEV",
  "CEG",
  "ASTS",
  "LLY",
  "UNH",
  "COST",
  "WMT",
  "MCD",
  "BRK-B",
  "VOO",
  "VTI",
  "QQQ",
  "SCHD",
  "BND",
  "GLD",
  "BTC-USD",
  "ETH-USD",
  "LINK",
  "ARM",
  "MRVL",
  "ANET",
  "VRT",
  "APP",
  "RDDT",
  "MELI",
  "ISRG",
].join(",");

const LIVE_TOPIC_LABELS: Record<string, { th: string; en: string }> = {
  "/concerts": { th: "ตารางคอนเสิร์ต", en: "concert schedule" },
  "/movies": { th: "หนังโรงไทยและ Netflix / ซีรีส์", en: "movies and streaming" },
  "/events": { th: "งานอีเวนต์ / Expo / Fair", en: "events, expo, and fair" },
};

const navItems: NavItem[] = [
  {
    href: "/",
    key: "nav_home",
    icon: "HM",
    update: {
      updatedAt: "2026-07-04T01:00:00.000Z",
      th: "ตั้งค่าเริ่มต้นเป็นธีมมืดและปรับหน้าแรกให้อ่านสบายขึ้น",
      en: "Default dark theme and refined landing readability",
    },
  },
  {
    href: "/dashboard",
    key: "nav_dashboard",
    icon: "DB",
    update: {
      updatedAt: "2026-07-04T01:15:00.000Z",
      th: "เพิ่มภาพรวม Daily Brief, API, Telegram และสถานะระบบ",
      en: "Daily Brief, API, Telegram, and system status overview updated",
    },
  },
  {
    href: "/daily",
    key: "nav_daily",
    icon: "DY",
    update: {
      updatedAt: "2026-07-04T01:30:00.000Z",
      th: "ข่าวทุกหมวดมีรูปจริง ลิงก์ต้นทาง และข้อมูลพร้อมส่ง Telegram",
      en: "Every news topic includes real images, source links, and Telegram-ready briefs",
    },
  },
  {
    href: "/stocks",
    key: "nav_stocks",
    icon: "ST",
    update: {
      updatedAt: "2026-07-04T01:45:00.000Z",
      th: "รวมราคาวันนี้ ปิดเมื่อวาน After Hours และ Heatmap ไว้ในหน้าเดียว",
      en: "Today, previous close, after-hours, and heatmap are in one view",
    },
  },
  {
    href: "/concerts",
    key: "nav_concerts",
    icon: "CN",
    update: {
      updatedAt: "2026-07-04T02:00:00.000Z",
      th: "ตารางคอนเสิร์ตแยกเดือน พร้อมรูปจริงและลิงก์ซื้อบัตร",
      en: "Monthly concert schedule with real posters and ticket links",
    },
  },
  {
    href: "/movies",
    key: "nav_movies",
    icon: "MV",
    update: {
      updatedAt: "2026-07-04T02:15:00.000Z",
      th: "หนังโรงไทยและ Netflix / ซีรีส์มีโปสเตอร์เต็มกรอบและแยกแพลตฟอร์ม",
      en: "Thai cinema and Netflix/series now show full posters by platform",
    },
  },
  {
    href: "/events",
    key: "nav_events",
    icon: "EV",
    update: {
      updatedAt: "2026-07-04T02:30:00.000Z",
      th: "เพิ่มงานอีเวนต์ / Expo / Fair พร้อมแยกหมวดและตัดข้อมูลซ้ำ",
      en: "Added Event / Expo / Fair categories with duplicate cleanup",
    },
  },
  {
    href: "/scheduled-tasks",
    key: "nav_scheduled_tasks",
    icon: "SC",
    update: {
      updatedAt: "2026-07-04T02:35:00.000Z",
      th: "จัดการงานอัตโนมัติ กำหนดเวลา และสั่งทำงานทันที",
      en: "Manage scheduled automations and run tasks on demand",
    },
  },
  {
    href: "/task-results",
    key: "nav_task_results",
    icon: "RS",
    update: {
      updatedAt: "2026-07-04T02:38:00.000Z",
      th: "ตรวจผลลัพธ์ รายละเอียด และสถานะการทำงานล่าสุด",
      en: "Review recent task results, details, and statuses",
    },
  },
  {
    href: "/data-library",
    key: "nav_data_library",
    icon: "DL",
    update: {
      updatedAt: "2026-07-04T02:40:00.000Z",
      th: "ค้นหาและจัดการแหล่งข้อมูลที่ระบบใช้งาน",
      en: "Search and manage connected data sources",
    },
  },
  {
    href: "/templates",
    key: "nav_templates",
    icon: "TP",
    update: {
      updatedAt: "2026-07-04T02:42:00.000Z",
      th: "เลือกเทมเพลตงานจากรายการที่มีอยู่ในระบบ",
      en: "Choose from the task templates available in the system",
    },
  },
  {
    href: "/notifications",
    key: "nav_notifications",
    icon: "NT",
    update: {
      updatedAt: "2026-07-04T02:45:00.000Z",
      th: "อัปเดตแจ้งเตือนสำคัญและสถานะอ่านแล้ว",
      en: "Important alerts and read states refreshed",
    },
  },
  {
    href: "/settings",
    key: "nav_settings",
    icon: "SE",
    update: {
      updatedAt: "2026-07-04T03:00:00.000Z",
      th: "ปรับภาษา ธีม และค่าการส่ง Telegram ให้ชัดขึ้น",
      en: "Language, theme, and Telegram preferences refined",
    },
  },
  {
    href: "/admin",
    key: "nav_admin",
    icon: "AD",
    update: {
      updatedAt: "2026-07-04T03:15:00.000Z",
      th: "เพิ่มภาพรวมผู้ใช้ สถานะระบบ และข้อมูลตรวจสอบ",
      en: "User overview, system health, and audit details updated",
    },
  },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function getUpdateText(item: NavItem, lang: string) {
  return lang === "th" ? item.update.th : item.update.en;
}

function formatUpdateTime(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return lang === "th" ? "ยังไม่เคยอัปเดต" : "Never updated";

  return new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function updateEntryIsNewer(entry: ManualUpdateEntry | undefined, fallback: UpdateCopy) {
  if (!entry?.updatedAt) return false;
  return new Date(entry.updatedAt).getTime() >= new Date(fallback.updatedAt).getTime();
}

function isSameBangkokDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" });
  return formatter.format(date) === formatter.format(new Date());
}

function formatTopicGroups(groups: Record<string, number> | undefined, lang: "th" | "en") {
  if (!groups) return "";
  const labels: Record<string, { th: string; en: string }> = {
    cinema: { th: "หนังโรง", en: "cinema" },
    streaming: { th: "Netflix", en: "Netflix" },
    indoor: { th: "Indoor", en: "indoor" },
    outdoor: { th: "Outdoor", en: "outdoor" },
    expo: { th: "Expo", en: "expo" },
    fair: { th: "Fair", en: "fair" },
    festival: { th: "Festival", en: "festival" },
  };

  return Object.entries(groups)
    .map(([key, count]) => `${labels[key]?.[lang] ?? key} ${count}`)
    .join(" / ");
}

async function refreshMenuTopic(href: string): Promise<Pick<ManualUpdateEntry, "status" | "th" | "en" | "newItems" | "expiredItems" | "itemIds">> {
  const now = Date.now();

  try {
    if (href === "/stocks") {
      const response = await fetch(`/api/stocks/quotes?symbols=${encodeURIComponent(STOCK_REFRESH_SYMBOLS)}&refresh=${now}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) throw new Error(`stocks ${response.status}`);
      const payload = (await response.json()) as { quotes?: Array<{ symbol?: string; price?: number; prevClose?: number; afterHours?: number }>; source?: string; error?: string };
      const count = payload.quotes?.length ?? 0;
      if (count === 0) throw new Error(payload.error || "no stock quotes");
      const newItems = countNewItems(href, (payload.quotes ?? []).map((quote) => `${quote.symbol ?? "unknown"}:${quote.price ?? ""}:${quote.prevClose ?? ""}:${quote.afterHours ?? ""}`));
      const newText = newItemText(newItems);
      return {
        status: "success",
        newItems,
        th: `ดึงราคาหุ้นสดได้ ${count} ตัว จาก ${payload.source || "Yahoo Finance"} · ${newText.th}`,
        en: `Fetched ${count} live stock quotes from ${payload.source || "Yahoo Finance"} · ${newText.en}`,
      };
    }

    if (href in LIVE_TOPIC_LABELS) {
      const response = await fetch(`/api/topic-refresh?topic=${encodeURIComponent(href.slice(1))}&refresh=${now}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const payload = (await response.json()) as {
        checked?: number;
        reachable?: number;
        success?: boolean;
        error?: string;
        summary?: { totalItems?: number; groups?: Record<string, number>; latestTitles?: string[] };
        items?: Array<{ id?: string; title?: string }>;
        expiredCount?: number;
      };
      const checked = payload.checked ?? 0;
      const reachable = payload.reachable ?? 0;
      const totalItems = payload.summary?.totalItems ?? 0;
      if (!response.ok || !payload.success) throw new Error(payload.error || `live sources ${reachable}/${checked}`);
      const label = LIVE_TOPIC_LABELS[href];
      const groupTextTh = formatTopicGroups(payload.summary?.groups, "th");
      const groupTextEn = formatTopicGroups(payload.summary?.groups, "en");
      const latestTh = payload.summary?.latestTitles?.slice(0, 3).join(" / ");
      const expiredItems = payload.expiredCount ?? 0;
      const itemIds = (payload.items ?? []).map((item, index) => item.id ?? item.title ?? String(index));
      const newItemIds = getNewItemIds(href, itemIds);
      const newItems = newItemIds.length;
      const newText = newItemText(newItems, expiredItems);
      return {
        status: "success",
        newItems,
        expiredItems,
        itemIds: newItemIds,
        th: `อัปเดต${label.th} ${totalItems} รายการ · ${newText.th}${groupTextTh ? ` (${groupTextTh})` : ""} · แหล่งข้อมูลตอบ ${reachable}/${checked}${latestTh ? ` · ล่าสุด: ${latestTh}` : ""}`,
        en: `Updated ${totalItems} ${label.en} items · ${newText.en}${groupTextEn ? ` (${groupTextEn})` : ""}; live sources ${reachable}/${checked}`,
      };
    }

    if (href === "/daily" || href === "/dashboard") {
      const response = await fetch(`/api/news/latest?refresh=${now}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) throw new Error(`news ${response.status}`);
      const payload = (await response.json()) as {
        data?: { items?: Array<{ id?: string; title?: string }>; summary?: { totalItems?: number; mode?: string } };
        items?: Array<{ id?: string; title?: string }>;
        summary?: { totalItems?: number; mode?: string };
      };
      const data = payload.data ?? payload;
      const count = data.summary?.totalItems ?? data.items?.length ?? 0;
      const newItems = countNewItems(href, (data.items ?? []).map((item, index) => item.id ?? item.title ?? String(index)));
      const newText = newItemText(newItems);
      return {
        status: "success",
        newItems,
        th: `ดึงข่าวล่าสุดได้ ${count} รายการ · ${newText.th} · โหมด ${data.summary?.mode || "live"}`,
        en: `Fetched ${count} latest news items · ${newText.en} in ${data.summary?.mode || "live"} mode`,
      };
    }

    if (href === "/notifications") {
      const response = await fetch(`/api/notifications?refresh=${now}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`notifications ${response.status}`);
      const payload = (await response.json()) as Array<{ id?: string; title?: string }> | { data?: Array<{ id?: string; title?: string }>; notifications?: Array<{ id?: string; title?: string }>; meta?: { total?: number } };
      const items = Array.isArray(payload) ? payload : payload.data ?? payload.notifications ?? [];
      const count = Array.isArray(payload) ? payload.length : payload.meta?.total ?? items.length;
      const newItems = countNewItems(href, items.map((item, index) => item.id ?? item.title ?? String(index)));
      const newText = newItemText(newItems);
      return {
        status: "success",
        newItems,
        th: `รีเฟรชการแจ้งเตือนล่าสุด ${count} รายการ · ${newText.th}`,
        en: `Refreshed ${count} notifications · ${newText.en}`,
      };
    }

    if (href === "/settings") {
      const response = await fetch(`/api/health?refresh=${now}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`health ${response.status}`);
      const payload = (await response.json()) as { status?: string; checks?: Record<string, unknown>; data?: Record<string, unknown> };
      const checks = Object.keys(payload.checks ?? payload.data ?? {}).length;
      return {
        status: "success",
        newItems: 0,
        th: `ตรวจสถานะระบบสำหรับหน้าตั้งค่าแล้ว ${checks || 1} จุด · เพิ่มใหม่ 0 รายการ`,
        en: `Checked ${checks || 1} system setting signals · 0 new items`,
      };
    }

    if (href === "/admin") {
      let response = await fetch(`/api/admin/metrics?refresh=${now}`, { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        response = await fetch(`/api/health?refresh=${now}`, { cache: "no-store" });
      }
      if (!response.ok) throw new Error(`admin ${response.status}`);
      const payload = (await response.json()) as { data?: { totals?: Record<string, number> }; status?: string };
      const totalSignals = Object.values(payload.data?.totals ?? {}).filter((value) => typeof value === "number").length;
      return {
        status: "success",
        newItems: 0,
        th: `รีเฟรชสถานะแอดมินและระบบแล้ว ${totalSignals || 1} สัญญาณ · เพิ่มใหม่ 0 รายการ`,
        en: `Refreshed ${totalSignals || 1} admin/system signals · 0 new items`,
      };
    }

    const response = await fetch(`${href}?refresh=${now}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`page ${response.status}`);
    return {
      status: "success",
      newItems: 0,
      th: "ตรวจข้อมูลหน้าเว็บล่าสุดแล้ว · เพิ่มใหม่ 0 รายการ",
      en: "Checked the latest page data · 0 new items",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "refresh failed";
    return {
      status: "error",
      newItems: 0,
      th: `อัปเดตจริงไม่สำเร็จ: ${message}`,
      en: `Live refresh failed: ${message}`,
    };
  }
}

export function Sidebar({ mobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { t, lang } = useLanguage();
  const [manualUpdates, setManualUpdates] = useState<ManualUpdateState>({});
  const [hydratedUpdates, setHydratedUpdates] = useState(false);
  const [updatingHref, setUpdatingHref] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [batchSummary, setBatchSummary] = useState<{ news: number; events: number; expired: number } | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(UPDATE_STORAGE_KEY);
      if (stored) {
        setManualUpdates(JSON.parse(stored) as ManualUpdateState);
      }
    } catch {
      setManualUpdates({});
    } finally {
      setHydratedUpdates(true);
    }
  }, []);

  useEffect(() => {
    if (!hydratedUpdates) return;
    window.localStorage.setItem(UPDATE_STORAGE_KEY, JSON.stringify(manualUpdates));
  }, [hydratedUpdates, manualUpdates]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleUpdateTopic = async (href: string) => {
    setUpdatingHref(href);
    const result = await refreshMenuTopic(href);
    setManualUpdates((current) => ({
      ...current,
      [href]: {
        updatedAt: new Date().toISOString(),
        count: (current[href]?.count ?? 0) + 1,
        ...result,
      },
    }));
    if (result.status === "success") window.dispatchEvent(new CustomEvent("nimbusdaily:topic-refreshed", { detail: { href, itemIds: result.itemIds ?? [] } }));
    setUpdatingHref(null);
  };

  const handleUpdateAllTopics = async () => {
    const now = new Date().toISOString();
    setUpdatingHref("__all__");
    const results = await Promise.all(navItems.map(async (item) => [item.href, await refreshMenuTopic(item.href)] as const));
    setManualUpdates((current) => {
      const next = { ...current };
      for (const [href, result] of results) {
        next[href] = {
          updatedAt: now,
          count: (current[href]?.count ?? 0) + 1,
          ...result,
        };
      }
      return next;
    });
    for (const [href, result] of results) {
      if (result.status === "success") window.dispatchEvent(new CustomEvent("nimbusdaily:topic-refreshed", { detail: { href, itemIds: result.itemIds ?? [] } }));
    }
    setBatchSummary({
      news: results.filter(([href]) => href === "/daily" || href === "/dashboard").reduce((sum, [, result]) => sum + (result.newItems ?? 0), 0),
      events: results.filter(([href]) => ["/concerts", "/movies", "/events"].includes(href)).reduce((sum, [, result]) => sum + (result.newItems ?? 0), 0),
      expired: results.reduce((sum, [, result]) => sum + (result.expiredItems ?? 0), 0),
    });
    setUpdatingHref(null);
  };

  return (
    <aside
      className={cn(
        "daily-sidebar border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl",
        mobile ? "flex h-full w-full flex-col p-4" : "fixed left-0 top-0 hidden h-screen w-72 flex-col p-4 lg:flex",
      )}
    >
      <Link href="/dashboard" className="flex min-h-14 items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.04]" onClick={onNavigate}>
        <div className="daily-logo relative grid h-12 w-12 grid-cols-2 gap-0.5 rounded-xl border border-cyan-200/20 bg-slate-950/40 p-1 shadow-[0_0_28px_rgba(34,211,238,0.22)]">
          <span className="rounded-sm bg-cyan-300" />
          <span className="rounded-sm bg-blue-400" />
          <span className="rounded-sm bg-emerald-300" />
          <span className="rounded-sm bg-violet-500" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-white">NimbusDaily</p>
          <p className="text-xs text-cyan-100/60">{t("sidebar_build_label")}</p>
        </div>
      </Link>

      <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.055] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase text-cyan-200">{t("sidebar_phase")}</p>
          <button
            type="button"
            disabled={updatingHref !== null}
            onClick={() => void handleUpdateAllTopics()}
            className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[11px] font-extrabold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatingHref === "__all__" ? (lang === "th" ? "กำลังดึง..." : "Updating...") : (lang === "th" ? "อัปเดตทั้งหมด" : "Update all")}
          </button>
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-400">{t("sidebar_desc")}</p>
        {batchSummary ? <p className="mt-3 rounded-md border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-2 text-xs font-extrabold text-emerald-100">{lang === "th" ? `สรุปรอบล่าสุด: ข่าวใหม่ ${batchSummary.news} · กิจกรรมใหม่ ${batchSummary.events} · หมดอายุ ${batchSummary.expired}` : `Latest: ${batchSummary.news} news · ${batchSummary.events} events · ${batchSummary.expired} expired`}</p> : null}
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const pathIsActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isActive = pendingHref ? item.href === pendingHref : pathIsActive;
          const label = item.key ? t(item.key) : lang === "th" ? item.th : item.en;
          const storedUpdate = manualUpdates[item.href];
          const manualUpdate = updateEntryIsNewer(storedUpdate, item.update) ? storedUpdate : undefined;
          const updatedAt = manualUpdate?.updatedAt ?? item.update.updatedAt;
          const updateCount = manualUpdate?.count ?? 0;
          const newItems = manualUpdate?.newItems ?? 0;
          const expiredItems = manualUpdate?.expiredItems ?? 0;
          const isFreshUpdate = manualUpdate?.status === "success" && updateCount > 0 && isSameBangkokDay(updatedAt);
          const isStaleUpdate = manualUpdate?.status === "error" || !isSameBangkokDay(updatedAt);

          return (
            <div
              key={item.href}
              className={cn(
                "group rounded-lg border transition-all duration-200",
                isFreshUpdate && "nimbus-live-new",
                isStaleUpdate && !isFreshUpdate && "nimbus-live-stale",
                isActive
                  ? "border-cyan-300/25 bg-cyan-300/[0.10] shadow-[0_0_26px_rgba(34,211,238,0.10)]"
                  : "border-white/0 bg-transparent hover:border-white/10 hover:bg-white/[0.045]",
              )}
            >
              <Link
                href={item.href}
                prefetch
                aria-current={isActive ? "page" : undefined}
                onPointerDown={() => setPendingHref(item.href)}
                onClick={() => {
                  setPendingHref(item.href);
                  onNavigate?.();
                }}
                className={cn(
                  "flex min-h-13 items-center gap-3 px-3.5 py-3 text-sm font-semibold transition-all",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[11px] font-extrabold transition",
                    isActive
                      ? "border-cyan-300/25 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.035] text-slate-400 group-hover:text-white",
                  )}
                >
                  {item.icon}
                </span>
                <span className="truncate">{label}</span>
              </Link>

              {(isActive || updatingHref === item.href) && <div className="px-3.5 pb-3">
                <div className="rounded-md border border-white/10 bg-slate-950/35 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-bold text-cyan-100/80">
                        {lang === "th" ? "อัปเดตล่าสุด" : "Last updated"}: {formatUpdateTime(updatedAt, lang)}
                      </p>
                      {manualUpdate?.status === "success" ? (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-100">
                            {lang === "th" ? `เพิ่มใหม่ ${newItems}` : `New ${newItems}`}
                          </span>
                          {expiredItems > 0 ? (
                            <span className="rounded-md border border-amber-300/25 bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-100">
                              {lang === "th" ? `ล้างหมดอายุ ${expiredItems}` : `Expired ${expiredItems}`}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={updatingHref !== null}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void handleUpdateTopic(item.href);
                      }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-sm font-extrabold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`${lang === "th" ? "อัปเดต" : "Update"} ${label}`}
                      title={`${lang === "th" ? "อัปเดต" : "Update"} ${label}`}
                    >
                      {updatingHref === item.href ? "…" : "↻"}
                    </button>
                  </div>
                  <p className={cn("mt-1.5 line-clamp-2 text-[11px] leading-5", manualUpdate?.status === "error" ? "text-amber-100" : "text-slate-300")}>
                    {(lang === "th" ? manualUpdate?.th : manualUpdate?.en) || getUpdateText(item, lang)}
                    {updateCount > 0 ? (
                      <span className={cn("font-bold", manualUpdate?.status === "error" ? "text-amber-200" : "text-cyan-200")}>
                        {" "}
                        {lang === "th" ? `(กดอัปเดตเอง ${updateCount} ครั้ง)` : `(manual updates: ${updateCount})`}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>}
            </div>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-xs font-bold text-white">Design System</p>
        <div className="mt-3 flex gap-2">
          {["bg-cyan-300", "bg-sky-400", "bg-blue-500", "bg-violet-500", "bg-purple-500"].map((color) => (
            <span key={color} className={cn("h-5 w-5 rounded-full shadow-lg", color)} />
          ))}
        </div>
        <p className="mt-4 text-xs font-bold text-slate-400">{lang === "th" ? "ธีม" : "Theme"}</p>
        <div className="mt-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
