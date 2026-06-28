"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  th: {
    nav: ["ฟีเจอร์", "จุดเด่น", "แพ็กเกจ", "รีวิว", "FAQ"],
    login: "เข้าสู่ระบบ",
    openApp: "เปิด Dashboard",
    eyebrow: "Premium Cream SaaS Dashboard",
    headline: "NimbusDaily ช่วยสรุปงาน ข่าว และแจ้งเตือนทุกวัน",
    accent: "ให้อ่านง่าย ส่งต่อไว และดูเป็นระบบ",
    description:
      "แดชบอร์ดงานอัตโนมัติสำหรับ Daily Brief, ข่าว, AI, Cybersecurity, หุ้น, อากาศ, อีเมล และ Telegram พร้อม UI โทนครีมอบอุ่นที่อ่านชัดทุกหน้าจอ",
    primaryCta: "เริ่มใช้งาน Dashboard",
    secondaryCta: "สร้างงานอัตโนมัติ",
    trusted: "พร้อมใช้งานกับ AI, Telegram, Supabase และระบบงานรายวัน",
    heroStats: [
      { label: "หัวข้อข่าว/งาน", value: "48+", hint: "รองรับรายวัน" },
      { label: "ส่ง Telegram", value: "1:1", hint: "หัวข้อละข้อความ" },
      { label: "ภาษา", value: "TH/EN", hint: "แปลก่อนสรุป" },
    ],
    previewStats: [
      { label: "Source Coverage", value: "12 feeds" },
      { label: "Readability", value: "98%" },
      { label: "Telegram Queue", value: "4 topics" },
    ],
    featuresTitle: "ฟีเจอร์หลักที่ใช้งานจริง",
    featuresSubtitle: "จัดข้อมูลสำคัญให้เป็นการ์ด อ่านเร็ว และกดส่งต่อได้ทันที",
    features: [
      { icon: "📰", title: "Daily Brief", tag: "News", description: "รวมข่าวไทย ต่างประเทศ AI Tech Cybersecurity Cloud ตลาด และโปรเดินทางในหน้าเดียว" },
      { icon: "⚡", title: "Automation", tag: "Workflow", description: "ตั้งเวลารันงาน สรุปผล ตรวจสถานะ และ retry งานที่ล้มเหลวได้จากแดชบอร์ด" },
      { icon: "✦", title: "AI Summary", tag: "Readable", description: "สรุปเป็นข้อ 1-5 พร้อมลิงก์จริง เน้นภาษาไทยอ่านง่ายก่อนส่งไป Telegram" },
      { icon: "🔔", title: "Smart Alert", tag: "Live", description: "แยกความสำคัญด้วย badge, priority score, status และการแจ้งเตือนแบบ product-ready" },
      { icon: "📚", title: "Data Library", tag: "Source", description: "เก็บข้อมูลเดิม ข่าวเต็ม ลิงก์อ้างอิง และผลลัพธ์ย้อนหลังไว้ค้นต่อได้" },
      { icon: "🛡", title: "Admin Control", tag: "Secure", description: "ดู usage, error, logs และสถานะระบบด้วย UI ที่สแกนง่าย" },
    ],
    highlightTitle: "โทนครีมใหม่ที่อ่านสบายขึ้น",
    highlightText:
      "ใช้พื้นหลัง #F7F0E6 การ์ด #FFF6EA / #E8DCCB และ accent #B88A5A เพื่อให้หัวข้อ ตัวเลข ป้ายสถานะ และ CTA มีน้ำหนักชัด โดยไม่ทำให้หน้าดูโล่งหรือจ้าเกินไป",
    highlightPoints: ["Contrast ชัดบนพื้นครีม", "Spacing แน่นพอดี", "Card หลายระดับ", "Mobile-first responsive"],
    statsTitle: "ภาพรวมระบบ",
    stats: [
      { label: "ผู้ใช้ทดลอง", value: "1.8K", detail: "เติบโต 24%" },
      { label: "คะแนนรีวิว", value: "4.9/5", detail: "อ่านง่ายขึ้น" },
      { label: "งานสำเร็จ", value: "96%", detail: "จาก workflow รายวัน" },
      { label: "ประหยัดเวลา", value: "6 ชม.", detail: "เฉลี่ยต่อสัปดาห์" },
    ],
    productsTitle: "บริการที่จัดไว้เป็นหมวด",
    products: [
      { title: "News Intelligence", price: "Daily", description: "ข่าวไทย ข่าวโลก AI Tech Security Cloud หุ้น อากาศ เดินทาง และโปรท่องเที่ยว", tags: ["ข่าวจริง", "ลิงก์จริง", "สรุปไทย"] },
      { title: "Telegram Briefing", price: "Auto", description: "ส่งหัวข้อละข้อความ พร้อมสรุปสั้น อ่านต่อด้วยลิงก์ต้นทาง และสถานะส่งสำเร็จ", tags: ["แปลก่อนส่ง", "ทีละหัวข้อ", "Retry"] },
      { title: "Ops Dashboard", price: "Pro", description: "ติดตาม task, result, alert, admin log และ source library ในระบบเดียว", tags: ["SaaS", "Responsive", "Production"] },
    ],
    reviewsTitle: "เสียงจากผู้ใช้",
    reviews: [
      { name: "Admin Ops", role: "Operations", quote: "หน้าใหม่อ่านง่ายขึ้นมาก เห็น priority กับ status ชัด ไม่ต้องไล่หาในตารางนาน" },
      { name: "Content Lead", role: "Daily Brief", quote: "สรุปข่าวเป็นเรื่องสั้น ๆ พร้อมลิงก์จริง ช่วยส่ง Telegram ตอนเช้าได้ไวขึ้น" },
      { name: "Security Analyst", role: "Cyber Alert", quote: "หมวดแจ้งเตือนแยกสีดีขึ้น อ่านบนธีมครีมสบายตาแต่ยังเห็น error ชัด" },
    ],
    faqTitle: "คำถามที่พบบ่อย",
    faqs: [
      { q: "ยังใช้โหมดมืดได้ไหม?", a: "ได้ ระบบยังคงธีมเดิมไว้ แต่ค่าเริ่มต้นและหน้าแรกถูกปรับให้ครีมดูพรีเมียมขึ้น" },
      { q: "Telegram ส่งข่าวจริงหรือไม่?", a: "ระบบออกแบบให้ใช้ข้อมูลจริงจาก source พร้อมลิงก์อ้างอิง และสรุปไทยก่อนส่ง" },
      { q: "รองรับมือถือไหม?", a: "รองรับ layout แบบ 1 คอลัมน์บนมือถือ และ 2-3 คอลัมน์บน desktop เพื่อไม่ให้โล่งหรือรก" },
    ],
    footerText: "NimbusDaily คือศูนย์กลางงานรายวัน ข่าว และ automation ที่อ่านง่าย ส่งต่อไว และพร้อมใช้งานจริง",
  },
  en: {
    nav: ["Features", "Highlights", "Plans", "Reviews", "FAQ"],
    login: "Login",
    openApp: "Open Dashboard",
    eyebrow: "Premium Cream SaaS Dashboard",
    headline: "NimbusDaily organizes daily briefs, news, and alerts",
    accent: "with clear reading, fast sharing, and calm structure",
    description:
      "An automation dashboard for daily briefs, news, AI, cybersecurity, markets, weather, email, and Telegram with a warm premium cream interface.",
    primaryCta: "Launch Dashboard",
    secondaryCta: "Create Automation",
    trusted: "Ready for AI, Telegram, Supabase, and daily operations",
    heroStats: [
      { label: "Topics", value: "48+", hint: "daily-ready" },
      { label: "Telegram", value: "1:1", hint: "one topic per message" },
      { label: "Language", value: "TH/EN", hint: "translate first" },
    ],
    previewStats: [
      { label: "Source Coverage", value: "12 feeds" },
      { label: "Readability", value: "98%" },
      { label: "Telegram Queue", value: "4 topics" },
    ],
    featuresTitle: "Practical Product Features",
    featuresSubtitle: "Important information becomes readable cards, quick actions, and share-ready summaries.",
    features: [
      { icon: "📰", title: "Daily Brief", tag: "News", description: "Thai news, world news, AI, security, cloud, markets, weather, travel, and deals in one place." },
      { icon: "⚡", title: "Automation", tag: "Workflow", description: "Schedule tasks, inspect results, monitor status, and retry failed workflows." },
      { icon: "✦", title: "AI Summary", tag: "Readable", description: "Short 1-5 point summaries with real links and Thai translation before Telegram delivery." },
      { icon: "🔔", title: "Smart Alert", tag: "Live", description: "Clear badges, priority scores, statuses, and product-ready notification states." },
      { icon: "📚", title: "Data Library", tag: "Source", description: "Keep source links, full articles, previous results, and searchable records." },
      { icon: "🛡", title: "Admin Control", tag: "Secure", description: "Review usage, errors, logs, and system health with scannable layouts." },
    ],
    highlightTitle: "A Softer Cream System",
    highlightText:
      "The interface uses #F7F0E6 backgrounds, #FFF6EA / #E8DCCB cards, and #B88A5A accents so headings, numbers, status badges, and CTAs stay readable without feeling empty.",
    highlightPoints: ["High cream contrast", "Balanced spacing", "Layered cards", "Mobile-first responsive"],
    statsTitle: "System Snapshot",
    stats: [
      { label: "Pilot Users", value: "1.8K", detail: "up 24%" },
      { label: "Review Score", value: "4.9/5", detail: "more readable" },
      { label: "Success Rate", value: "96%", detail: "daily workflows" },
      { label: "Time Saved", value: "6h", detail: "avg per week" },
    ],
    productsTitle: "Service Modules",
    products: [
      { title: "News Intelligence", price: "Daily", description: "Real news, source links, Thai summaries, travel deals, markets, security, and cloud updates.", tags: ["Real links", "Thai summary", "Verified"] },
      { title: "Telegram Briefing", price: "Auto", description: "One topic per message, concise summaries, source links, delivery status, and retry controls.", tags: ["Translate first", "1:1 topics", "Retry"] },
      { title: "Ops Dashboard", price: "Pro", description: "Tasks, results, alerts, admin logs, and source libraries in a single production dashboard.", tags: ["SaaS", "Responsive", "Production"] },
    ],
    reviewsTitle: "User Reviews",
    reviews: [
      { name: "Admin Ops", role: "Operations", quote: "The new view is easier to scan. Priority and status are clear without digging through tables." },
      { name: "Content Lead", role: "Daily Brief", quote: "Short news summaries with real links make morning Telegram delivery much faster." },
      { name: "Security Analyst", role: "Cyber Alert", quote: "The cream theme is calmer while errors and warning states remain visible." },
    ],
    faqTitle: "FAQ",
    faqs: [
      { q: "Can I still use dark mode?", a: "Yes. The original theme remains, while the default and landing experience now emphasize premium cream." },
      { q: "Does Telegram use real news?", a: "The system is designed around real sources, source links, and Thai summaries before delivery." },
      { q: "Is it mobile-ready?", a: "Yes. Sections collapse to one column on mobile and use 2-3 columns on desktop." },
    ],
    footerText: "NimbusDaily is a daily operations, news, and automation hub built for readable action.",
  },
} as const;

const progressWidths = ["w-[68%]", "w-[76%]", "w-[84%]", "w-[92%]"] as const;

export default function HomePage() {
  const { lang } = useLanguage();
  const text = copy[lang];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F0E6] text-[#2E2A26]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(184,138,90,0.20),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(126,92,54,0.14),transparent_26%),linear-gradient(135deg,rgba(255,246,234,0.90),rgba(232,220,203,0.88))]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(107,90,74,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(107,90,74,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <header className="sticky top-0 z-30 border-b border-[#B88A5A]/20 bg-[#FFF6EA]/90 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 grid-cols-2 gap-0.5 rounded-xl border border-[#B88A5A]/30 bg-[#2E2A26] p-1 shadow-lg shadow-[#B88A5A]/20">
              <span className="rounded-[4px] bg-[#B88A5A]" />
              <span className="rounded-[4px] bg-[#E8DCCB]" />
              <span className="rounded-[4px] bg-[#D3A56F]" />
              <span className="rounded-[4px] bg-[#FFF6EA]" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight text-[#2E2A26]">NimbusDaily</p>
              <p className="text-xs font-semibold text-[#6B5A4A]">{text.eyebrow}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {text.nav.map((item) => (
              <a key={item} className="rounded-xl px-3 py-2 text-sm font-bold text-[#6B5A4A] transition hover:bg-[#E8DCCB]/70 hover:text-[#2E2A26]" href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link className="hidden rounded-xl px-4 py-2 text-sm font-bold text-[#6B5A4A] transition hover:bg-[#E8DCCB]/70 hover:text-[#2E2A26] sm:block" href="/login">
              {text.login}
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-xl bg-[#2E2A26] px-4 py-2 text-sm font-extrabold text-[#FFF6EA] shadow-lg shadow-[#2E2A26]/15 transition hover:bg-[#3B342E]" href="/dashboard">
              {text.openApp}
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1480px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#B88A5A]/25 bg-[#FFF6EA] px-4 py-2 text-xs font-extrabold uppercase text-[#8A633C] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#B88A5A]" />
            {text.trusted}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] text-[#2E2A26] sm:text-6xl lg:text-7xl">
            {text.headline}
            <span className="mt-2 block text-[#B88A5A]">{text.accent}</span>
          </h1>
          <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-[#5C4D40] sm:text-lg">
            {text.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8A633C]/25 bg-[#B88A5A] px-6 py-3 text-base font-extrabold text-[#FFF6EA] shadow-lg shadow-[#B88A5A]/25 transition hover:bg-[#9E7144]" href="/dashboard">
              {text.primaryCta}
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#B88A5A]/25 bg-[#FFF6EA] px-6 py-3 text-base font-extrabold text-[#2E2A26] shadow-sm shadow-[#6B5A4A]/8 transition hover:bg-[#E8DCCB]" href="/scheduled-tasks/create">
              {text.secondaryCta}
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {text.heroStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#B88A5A]/18 bg-[#FFF6EA]/90 p-4 shadow-sm shadow-[#6B5A4A]/5">
                <p className="text-xs font-extrabold uppercase text-[#6B5A4A]">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#2E2A26]">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-[#8A633C]">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="self-start rounded-[2rem] border border-[#B88A5A]/20 bg-[#FFF6EA]/88 p-4 shadow-2xl shadow-[#6B5A4A]/12 sm:p-6">
          <div className="rounded-[1.45rem] border border-[#B88A5A]/18 bg-[#2E2A26] p-5 text-[#FFF6EA] shadow-xl shadow-[#2E2A26]/18">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase text-[#D8B487]">Live Brief Control</p>
                <h2 className="mt-2 text-2xl font-extrabold">Morning Operations</h2>
              </div>
              <span className="rounded-full bg-[#B88A5A] px-3 py-1 text-xs font-extrabold text-[#FFF6EA]">Ready</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {text.features.slice(0, 4).map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#FFF6EA]/10 bg-[#FFF6EA]/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl" aria-hidden>{item.icon}</span>
                    <span className="rounded-full bg-[#B88A5A]/25 px-2.5 py-1 text-[11px] font-extrabold text-[#F4D3AB]">{item.tag}</span>
                  </div>
                  <p className="mt-3 font-extrabold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-[#E8DCCB]">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[#D8B487]/20 bg-[#B88A5A]/18 p-4">
              <p className="text-sm font-extrabold text-[#F4D3AB]">{text.highlightTitle}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#FFF6EA]/12">
                <div className="h-full w-[82%] rounded-full bg-[#D8B487]" />
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {text.previewStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#B88A5A]/16 bg-[#F7F0E6] p-4">
                <p className="text-[11px] font-extrabold uppercase text-[#6B5A4A]">{item.label}</p>
                <p className="mt-2 text-lg font-extrabold text-[#2E2A26]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 pb-10 sm:px-6 lg:px-8" id={text.nav[0].toLowerCase()}>
        <div className="flex flex-col justify-between gap-4 border-y border-[#B88A5A]/18 py-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#B88A5A]">{text.featuresTitle}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#2E2A26] sm:text-4xl">{text.featuresSubtitle}</h2>
          </div>
          <Badge tone="gray">#F7F0E6 / #B88A5A</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {text.features.map((item) => (
            <article key={item.title} className="rounded-3xl border border-[#B88A5A]/18 bg-[#FFF6EA] p-5 shadow-lg shadow-[#6B5A4A]/7 transition hover:-translate-y-0.5 hover:border-[#B88A5A]/38">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8DCCB] text-2xl" aria-hidden>{item.icon}</span>
                <span className="rounded-full bg-[#F1E4D2] px-3 py-1 text-xs font-extrabold text-[#8A633C]">{item.tag}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-[#2E2A26]">{item.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#5C4D40]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-5 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8" id={text.nav[1].toLowerCase()}>
        <div className="rounded-3xl border border-[#B88A5A]/20 bg-[#2E2A26] p-6 text-[#FFF6EA] shadow-2xl shadow-[#2E2A26]/12">
          <p className="text-sm font-extrabold uppercase text-[#D8B487]">{text.highlightTitle}</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight">{text.highlightText}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {text.highlightPoints.map((point, index) => (
            <div key={point} className="rounded-3xl border border-[#B88A5A]/18 bg-[#FFF6EA] p-5">
              <p className="text-4xl font-extrabold text-[#B88A5A]">0{index + 1}</p>
              <p className="mt-4 text-lg font-extrabold text-[#2E2A26]">{point}</p>
              <div className="mt-4 h-1.5 rounded-full bg-[#E8DCCB]">
                <div className={`h-full rounded-full bg-[#B88A5A] ${progressWidths[index]}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-[#2E2A26]">{text.statsTitle}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {text.stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[#B88A5A]/18 bg-[#FFF6EA]/92 p-5 shadow-lg shadow-[#6B5A4A]/6">
              <p className="text-xs font-extrabold uppercase text-[#6B5A4A]">{item.label}</p>
              <p className="mt-3 text-4xl font-extrabold text-[#2E2A26]">{item.value}</p>
              <p className="mt-2 inline-flex rounded-full bg-[#F1E4D2] px-3 py-1 text-xs font-extrabold text-[#8A633C]">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8" id={text.nav[2].toLowerCase()}>
        <h2 className="text-3xl font-extrabold text-[#2E2A26]">{text.productsTitle}</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {text.products.map((item) => (
            <article key={item.title} className="rounded-3xl border border-[#B88A5A]/22 bg-gradient-to-br from-[#FFF6EA] to-[#E8DCCB] p-6 shadow-xl shadow-[#6B5A4A]/8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-extrabold text-[#2E2A26]">{item.title}</h3>
                <span className="rounded-2xl bg-[#B88A5A] px-3 py-2 text-sm font-extrabold text-[#FFF6EA]">{item.price}</span>
              </div>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#5C4D40]">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#B88A5A]/20 bg-[#FFF6EA]/80 px-3 py-1 text-xs font-extrabold text-[#8A633C]">{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8" id={text.nav[3].toLowerCase()}>
        <h2 className="text-3xl font-extrabold text-[#2E2A26]">{text.reviewsTitle}</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {text.reviews.map((review) => (
            <figure key={review.name} className="rounded-3xl border border-[#B88A5A]/18 bg-[#FFF6EA] p-6 shadow-lg shadow-[#6B5A4A]/7">
              <blockquote className="text-base font-semibold leading-8 text-[#4C4035]">“{review.quote}”</blockquote>
              <figcaption className="mt-6 border-t border-[#B88A5A]/15 pt-4">
                <p className="font-extrabold text-[#2E2A26]">{review.name}</p>
                <p className="text-sm font-semibold text-[#8A633C]">{review.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8" id={text.nav[4].toLowerCase()}>
        <div className="rounded-[2rem] border border-[#B88A5A]/20 bg-[#FFF6EA] p-5 shadow-xl shadow-[#6B5A4A]/8 sm:p-7">
          <h2 className="text-3xl font-extrabold text-[#2E2A26]">{text.faqTitle}</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {text.faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-[#B88A5A]/15 bg-[#F7F0E6] p-5">
                <p className="text-lg font-extrabold text-[#2E2A26]">{faq.q}</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#5C4D40]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-[#B88A5A]/20 bg-[#2E2A26] text-[#FFF6EA]">
        <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="text-2xl font-extrabold">NimbusDaily</p>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-[#E8DCCB]">{text.footerText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Dashboard", "Daily Brief", "Telegram", "Settings"].map((item) => (
              <Link key={item} className="rounded-xl border border-[#FFF6EA]/10 px-3 py-2 text-sm font-bold text-[#E8DCCB] hover:bg-[#FFF6EA]/10" href={item === "Dashboard" ? "/dashboard" : item === "Daily Brief" ? "/daily" : item === "Settings" ? "/settings" : "/notifications"}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
