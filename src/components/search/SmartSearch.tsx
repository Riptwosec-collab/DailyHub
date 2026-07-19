"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SearchApiResponse, SearchCategory, SearchResult } from "@/types/search";

const recentStorageKey = "nimbusdaily-recent-searches";
const categories: Array<{ value: SearchCategory; th: string; en: string }> = [
  { value: "all", th: "ทั้งหมด", en: "All" },
  { value: "daily", th: "ข่าว", en: "News" },
  { value: "stocks", th: "หุ้น", en: "Stocks" },
  { value: "concerts", th: "คอนเสิร์ต", en: "Concerts" },
  { value: "movies", th: "หนัง", en: "Movies" },
  { value: "events", th: "อีเวนต์", en: "Events" },
];

const categoryStyle: Record<SearchResult["category"], string> = {
  daily: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  stocks: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  concerts: "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100",
  movies: "border-violet-300/25 bg-violet-300/10 text-violet-100",
  events: "border-amber-300/25 bg-amber-300/10 text-amber-100",
};

export function SmartSearch({ lang }: { lang: "th" | "en" }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(window.localStorage.getItem(recentStorageKey) ?? "[]") as string[]);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    setActiveIndex(-1);
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&category=${category}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`search ${response.status}`);
        const payload = await response.json() as SearchApiResponse;
        setResults(payload.results);
      } catch (requestError) {
        if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
          setError(true);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 260);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, query]);

  const saveRecent = (value: string) => {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
  };

  const openResult = (result: SearchResult) => {
    saveRecent(query.trim());
    setOpen(false);
    router.push(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      openResult(results[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div className={cn("flex h-11 items-center rounded-lg border bg-slate-950/75 transition", open ? "border-cyan-300/40" : "border-white/10 hover:border-white/20")}>
        <span className="grid h-full w-10 shrink-0 place-items-center text-lg text-slate-400" aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="global-search-results"
          aria-expanded={open}
          aria-label={lang === "th" ? "ค้นหาข้อมูลทั้งหมด" : "Search all data"}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={lang === "th" ? "ค้นหาข่าว หุ้น คอนเสิร์ต หนัง อีเวนต์..." : "Search news, stocks, concerts, movies, events..."}
          role="combobox"
          value={query}
        />
        <select aria-label={lang === "th" ? "เลือกหมวดค้นหา" : "Select search category"} className="mr-1 h-8 max-w-24 rounded-md border border-white/10 bg-slate-900 px-2 text-xs font-bold text-slate-200 outline-none sm:max-w-28" value={category} onChange={(event) => { setCategory(event.target.value as SearchCategory); setOpen(true); }}>
          {categories.map((item) => <option key={item.value} value={item.value}>{lang === "th" ? item.th : item.en}</option>)}
        </select>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,36rem)] overflow-y-auto rounded-lg border border-white/10 bg-[#07101f]/98 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {query.trim().length < 2 ? (
            <div className="p-2">
              <div className="flex items-center justify-between gap-3 px-2">
                <p className="text-xs font-bold text-slate-400">{lang === "th" ? "ค้นหาล่าสุด" : "Recent searches"}</p>
                {recent.length ? <button type="button" className="text-xs font-bold text-cyan-200 hover:text-white" onClick={() => { setRecent([]); window.localStorage.removeItem(recentStorageKey); }}>{lang === "th" ? "ล้าง" : "Clear"}</button> : null}
              </div>
              {recent.length ? <div className="mt-2 flex flex-wrap gap-2">{recent.map((item) => <button key={item} type="button" onClick={() => setQuery(item)} className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-300/25 hover:text-white">{item}</button>)}</div> : <p className="px-2 py-4 text-sm text-slate-500">{lang === "th" ? "พิมพ์อย่างน้อย 2 ตัวอักษร" : "Type at least 2 characters"}</p>}
            </div>
          ) : loading ? (
            <div className="space-y-2 p-2" aria-live="polite"><p className="text-xs font-bold text-cyan-100">{lang === "th" ? "กำลังค้นหาข้อมูล..." : "Searching..."}</p>{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-md bg-white/[0.05]" />)}</div>
          ) : error ? (
            <div className="p-5 text-center"><p className="font-bold text-white">{lang === "th" ? "ค้นหาไม่สำเร็จ" : "Search failed"}</p><button type="button" onClick={() => setQuery((value) => `${value} `)} className="mt-3 rounded-md border border-cyan-300/25 px-3 py-2 text-xs font-bold text-cyan-100">{lang === "th" ? "ลองใหม่" : "Retry"}</button></div>
          ) : results.length ? (
            <div id="global-search-results" role="listbox" aria-label={lang === "th" ? "ผลการค้นหา" : "Search results"}>
              <p className="px-2 py-1 text-xs font-bold text-slate-500">{lang === "th" ? `พบ ${results.length} รายการ` : `${results.length} results`}</p>
              {results.map((result, index) => (
                <button key={result.id} type="button" role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => openResult(result)} className={cn("flex w-full items-start gap-3 rounded-md p-3 text-left transition", activeIndex === index ? "bg-cyan-300/10" : "hover:bg-white/[0.05]")}>
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md border text-[11px] font-extrabold", categoryStyle[result.category])}>{result.code}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-extrabold text-white">{highlight(result.title, query)}</span><span className="mt-1 block truncate text-xs text-slate-400">{result.subtitle}</span><span className="mt-1 block text-[11px] font-semibold text-cyan-100/70">{result.matchReason}</span></span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center"><p className="font-bold text-white">{lang === "th" ? `ไม่พบ “${query.trim()}”` : `No results for “${query.trim()}”`}</p><p className="mt-2 text-xs text-slate-400">{lang === "th" ? "ลองเปลี่ยนคำค้นหรือเลือกหมวดทั้งหมด" : "Try another query or select All"}</p></div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function highlight(text: string, query: string) {
  const token = query.trim().split(/\s+/)[0];
  if (!token) return text;
  const index = text.toLocaleLowerCase("th-TH").indexOf(token.toLocaleLowerCase("th-TH"));
  if (index < 0) return text;
  return <>{text.slice(0, index)}<mark className="rounded-sm bg-cyan-300/20 px-0.5 text-cyan-50">{text.slice(index, index + token.length)}</mark>{text.slice(index + token.length)}</>;
}
