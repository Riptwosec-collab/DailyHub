"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  th: {
    nav: ["ฟีเจอร์", "แหล่งข้อมูล", "ราคา", "อัปเดต", "FAQ", "ติดต่อเรา"],
    login: "เข้าสู่ระบบ",
    openApp: "เริ่มใช้งาน Dashboard",
    preview: "ดูตัวอย่าง Dashboard",
    eyebrow: "AI-powered daily intelligence",
    brand: "NimbusDaily",
    headline: "สรุปทุกสิ่งที่สำคัญในที่เดียว",
    accent: "เพื่อวันทำงานที่เร็วกว่า ฉลาดกว่า",
    description: "รวมสรุปข่าว, AI, Cybersecurity, ตลาด, อากาศ, อีเมล และการแจ้งเตือน Telegram ให้คุณตัดสินใจได้อย่างมั่นใจทุกวัน",
    promise: ["ตั้งค่าใช้งานใน 1 นาที", "เชื่อมต่อ Telegram", "ยกเลิกได้ตลอดเวลา"],
    commandTitle: "Live Command Center",
    commandUpdated: "อัปเดตล่าสุด 07:42 AM",
    morning: "Morning Brief",
    morningDesc: "สรุปเหตุการณ์สำคัญที่ควรรู้ในเช้านี้",
    morningItems: ["ข่าวเด่นในประเทศและต่างประเทศ", "AI และเทคโนโลยีล่าสุด", "Cybersecurity Threat Update", "สภาพอากาศและการเดินทาง", "ตลาดหุ้นและคริปโต"],
    modules: [
      { title: "AI Updates", tag: "NEW", value: "7 หัวข้อ", desc: "สรุปโมเดลและความก้าวหน้าล่าสุด" },
      { title: "Cybersecurity", tag: "ALERT", value: "4 รายการ", desc: "ช่องโหว่และภัยคุกคามที่น่าจับตา" },
      { title: "Market Watch", tag: "LIVE", value: "SET +0.48%", desc: "ตลาดหุ้น คริปโต และราคาอ้างอิง" },
      { title: "Weather Today", tag: "", value: "28°C", desc: "กรุงเทพมหานคร เมฆบางส่วน" },
    ],
    mini: [
      { title: "Email Digest", value: "12 ฉบับใหม่", desc: "สรุปอีเมลสำคัญจากกล่องจดหมาย" },
      { title: "Telegram Alerts", value: "18 ข้อความใหม่", desc: "การแจ้งเตือนจากข่าวและงานที่ติดตาม" },
      { title: "Smart Priority", value: "High 5 / Medium 7", desc: "จัดลำดับความสำคัญให้อัตโนมัติ" },
    ],
    score: "Readability Score",
    sources: ["Reuters", "Bloomberg", "TechCrunch", "The Hacker News", "SET", "CoinGecko", "กรมอุตุนิยมวิทยา", "Gmail", "Telegram"],
    stats: [
      { label: "Source Coverage", value: "24+", hint: "แหล่งข้อมูลคุณภาพ" },
      { label: "Readability", value: "98%", hint: "คะแนนความอ่านง่าย" },
      { label: "Telegram Queue", value: "18", hint: "ข้อความพร้อมส่ง" },
      { label: "Key Metrics", value: "99.9%", hint: "Uptime" },
    ],
  },
  en: {
    nav: ["Features", "Sources", "Pricing", "Updates", "FAQ", "Contact"],
    login: "Login",
    openApp: "Launch Dashboard",
    preview: "Preview Dashboard",
    eyebrow: "AI-powered daily intelligence",
    brand: "NimbusDaily",
    headline: "Everything important in one place",
    accent: "for faster, smarter workdays",
    description: "Daily news, AI, cybersecurity, markets, weather, email, and Telegram alerts organized into one calm decision dashboard.",
    promise: ["Ready in 1 minute", "Telegram connected", "Cancel anytime"],
    commandTitle: "Live Command Center",
    commandUpdated: "Last updated 07:42 AM",
    morning: "Morning Brief",
    morningDesc: "Important events to know this morning",
    morningItems: ["Local and global headlines", "Latest AI and technology", "Cybersecurity threat update", "Weather and commute", "Stocks and crypto"],
    modules: [
      { title: "AI Updates", tag: "NEW", value: "7 topics", desc: "Model and product progress summarized" },
      { title: "Cybersecurity", tag: "ALERT", value: "4 items", desc: "Threats and advisories worth watching" },
      { title: "Market Watch", tag: "LIVE", value: "SET +0.48%", desc: "Stocks, crypto, and reference prices" },
      { title: "Weather Today", tag: "", value: "28°C", desc: "Bangkok, partly cloudy" },
    ],
    mini: [
      { title: "Email Digest", value: "12 new", desc: "Important inbox messages summarized" },
      { title: "Telegram Alerts", value: "18 new", desc: "Alerts from tracked news and tasks" },
      { title: "Smart Priority", value: "High 5 / Medium 7", desc: "Automatic priority ranking" },
    ],
    score: "Readability Score",
    sources: ["Reuters", "Bloomberg", "TechCrunch", "The Hacker News", "SET", "CoinGecko", "Thai Meteorological", "Gmail", "Telegram"],
    stats: [
      { label: "Source Coverage", value: "24+", hint: "quality feeds" },
      { label: "Readability", value: "98%", hint: "reader score" },
      { label: "Telegram Queue", value: "18", hint: "ready messages" },
      { label: "Key Metrics", value: "99.9%", hint: "Uptime" },
    ],
  },
} as const;

export default function HomePage() {
  const { lang } = useLanguage();
  const text = copy[lang];

  return (
    <main className="landing-hud min-h-screen overflow-hidden bg-[#020716] px-3 py-3 text-white sm:px-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.28),transparent_30%),radial-gradient(circle_at_76%_16%,rgba(79,70,229,0.30),transparent_30%),linear-gradient(180deg,#020716_0%,#041128_54%,#050816_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1880px] rounded-[1.6rem] border border-cyan-300/25 bg-slate-950/38 p-4 shadow-[0_0_70px_rgba(14,165,233,0.16)] backdrop-blur-2xl sm:p-5 xl:p-7">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-300/16 bg-slate-950/34 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.22)]">
              <span className="text-3xl">☁</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none text-white">{text.brand}</p>
              <p className="text-xs font-semibold text-cyan-100/70">Premium Dark SaaS Dashboard</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {text.nav.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-extrabold text-slate-200 transition hover:text-cyan-200">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/login" className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/[0.09] sm:inline-flex">
              {text.login}
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-cyan-200/30 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_0_28px_rgba(59,130,246,0.30)] transition hover:brightness-110">
              {text.openApp} →
            </Link>
          </div>
        </header>

        <div className="grid gap-8 px-4 py-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-center xl:px-10 xl:py-8 2xl:py-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-extrabold uppercase text-cyan-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
              {text.eyebrow}
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-7xl 2xl:text-8xl">
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">{text.brand}</span>
              <span className="mt-3 block">{text.headline}</span>
              <span className="mt-3 block text-3xl leading-tight text-cyan-300 sm:text-5xl">{text.accent} ⚡</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-300 sm:text-lg">{text.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-cyan-200/25 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-7 py-3 text-base font-extrabold text-white shadow-[0_0_32px_rgba(59,130,246,0.35)] transition hover:-translate-y-0.5 hover:brightness-110">
                🚀 {text.openApp}
              </Link>
              <Link href="/daily" className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/50 px-7 py-3 text-base font-extrabold text-white transition hover:border-cyan-300/35 hover:bg-white/[0.08]">
                ▶ {text.preview}
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-300">
              {text.promise.map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="rounded-[2rem] border border-cyan-300/22 bg-slate-950/42 p-4 shadow-[0_0_60px_rgba(14,165,233,0.14)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                    <p className="text-sm font-extrabold uppercase text-cyan-100">{text.commandTitle}</p>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{text.commandUpdated}</p>
                </div>
                <span className="rounded-full border border-cyan-300/18 bg-slate-950/60 px-3 py-1 text-xs font-bold text-cyan-100">Auto Refresh</span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                <article className="rounded-2xl border border-cyan-300/35 bg-cyan-300/[0.07] p-5 shadow-[0_0_32px_rgba(34,211,238,0.14)]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-white">🌤 {text.morning}</h2>
                    <span className="rounded-lg bg-cyan-300/15 px-2.5 py-1 text-xs font-black text-cyan-100">LIVE</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{text.morningDesc}</p>
                  <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-300">
                    {text.morningItems.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="text-cyan-300">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                  {text.modules.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-cyan-300/18 bg-white/[0.045] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black text-white">{item.title}</h3>
                        {item.tag ? <span className="rounded-lg bg-cyan-300/14 px-2 py-1 text-[11px] font-black text-cyan-100">{item.tag}</span> : null}
                      </div>
                      <p className="mt-4 text-lg font-black text-cyan-200">{item.value}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">{item.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {text.mini.map((item) => (
                <article key={item.title} className="rounded-2xl border border-cyan-300/18 bg-slate-950/42 p-4 backdrop-blur-xl">
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="mt-3 text-xl font-black text-emerald-300">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{item.desc}</p>
                </article>
              ))}
              <article className="rounded-2xl border border-cyan-300/18 bg-slate-950/42 p-5 text-center backdrop-blur-xl">
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-cyan-400/25 bg-cyan-300/10 text-3xl font-black text-cyan-100">98%</div>
                <p className="mt-4 text-sm font-extrabold text-white">{text.score}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-300">AI Confidence: High</p>
              </article>
            </aside>
          </div>
        </div>

        <div className="mx-4 rounded-2xl border border-cyan-300/16 bg-slate-950/38 px-5 py-4 xl:mx-10">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-extrabold text-slate-300">
            <span className="text-cyan-100">{lang === "th" ? "เชื่อมต่อแหล่งข้อมูลชั้นนำ" : "Connected sources"}</span>
            {text.sources.map((source) => <span key={source}>{source}</span>)}
          </div>
        </div>

        <div className="mx-4 mt-4 grid gap-4 sm:grid-cols-2 xl:mx-10 xl:grid-cols-4">
          {text.stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-cyan-300/18 bg-slate-950/40 p-5 backdrop-blur-xl">
              <p className="text-xs font-extrabold uppercase text-cyan-100/75">{item.label}</p>
              <p className="mt-2 text-4xl font-black text-cyan-200">{item.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
