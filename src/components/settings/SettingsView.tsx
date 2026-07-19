"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { showToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { NimbusDailySettings, SchedulerMode, TelegramMode, OpenAiMode } from "@/types/settings";

const timezones = ["Asia/Bangkok", "UTC", "Asia/Singapore", "Asia/Tokyo", "America/New_York", "Europe/London"];

const copy = {
  th: {
    loadingTitle: "กำลังโหลดการตั้งค่า",
    loadingDesc: "กำลังโหลดการตั้งค่าระบบ",
    errorTitle: "โหลดการตั้งค่าไม่สำเร็จ",
    notFoundTitle: "ไม่พบการตั้งค่า",
    notFoundDesc: "ไม่พบข้อมูลการตั้งค่าระบบ",
    badge: "การตั้งค่าระบบ",
    title: "ตั้งค่า",
    desc: "ตั้งค่าโหมด OpenAI, Telegram, Scheduler, Timezone และแหล่งข้อมูลก่อนใช้งานจริง",
    saving: "กำลังบันทึก...",
    save: "บันทึกการตั้งค่า",
    savedTitle: "บันทึกการตั้งค่าแล้ว",
    savedDesc: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว",
    saveFailed: "บันทึกไม่สำเร็จ",
    aiMode: "โหมด AI",
    aiDesc: "เลือก mock เพื่อทดสอบ หรือ real เมื่อใส่ API key แล้ว",
    botAlerts: "แจ้งเตือนผ่าน Bot",
    botDesc: "เปิดเมื่อใส่ TELEGRAM_BOT_TOKEN และ TELEGRAM_CHAT_ID แล้ว",
    runMode: "โหมดการรัน",
    runDesc: "Vercel Hobby ใช้ daily cron ได้ หรือใช้ external scheduler แทน",
    runtime: "ค่าเริ่มต้นการรัน",
    priority: "คะแนนขั้นต่ำเริ่มต้น",
    dataSources: "แหล่งข้อมูล",
    checklist: "เช็กลิสต์ Production",
    checks: ["ใส่ Environment Variables ใน Vercel", "เช็กว่า .env.local ไม่อยู่ใน GitHub", "เปิด Supabase RLS ก่อนใช้จริง", "ใช้ external scheduler ถ้าต้องรันถี่กว่า daily"],
    sourceLabels: {
      enableWebNotifications: "แจ้งเตือนบนเว็บ",
      enableNewsDataSource: "แหล่งข่าว",
      enableWeatherDataSource: "แหล่งสภาพอากาศ",
      enableEmailDataSource: "แหล่งอีเมล",
    },
  },
  en: {
    loadingTitle: "Loading settings",
    loadingDesc: "Loading system settings",
    errorTitle: "Settings loading failed",
    notFoundTitle: "Settings not found",
    notFoundDesc: "System settings were not found",
    badge: "System preferences",
    title: "Settings",
    desc: "Configure OpenAI, Telegram, Scheduler, Timezone, and data sources before production use.",
    saving: "Saving...",
    save: "Save Settings",
    savedTitle: "Settings saved",
    savedDesc: "System settings were saved successfully.",
    saveFailed: "Save failed",
    aiMode: "AI Mode",
    aiDesc: "Choose mock for testing, or real after adding an API key.",
    botAlerts: "Bot Alerts",
    botDesc: "Enable after adding TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.",
    runMode: "Run Mode",
    runDesc: "Vercel Hobby supports daily cron, or use an external scheduler.",
    runtime: "Default Runtime",
    priority: "Default Min Priority",
    dataSources: "Data Sources",
    checklist: "Production Checklist",
    checks: ["Add Environment Variables in Vercel", "Check that .env.local is not in GitHub", "Enable Supabase RLS before production", "Use an external scheduler for runs more frequent than daily"],
    sourceLabels: {
      enableWebNotifications: "Web Notifications",
      enableNewsDataSource: "News Source",
      enableWeatherDataSource: "Weather Source",
      enableEmailDataSource: "Email Source",
    },
  },
} as const;

const sourceKeys = ["enableWebNotifications", "enableNewsDataSource", "enableWeatherDataSource", "enableEmailDataSource"] as const;

export function SettingsView() {
  const { lang } = useLanguage();
  const text = copy[lang];
  const [settings, setSettings] = useState<NimbusDailySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);
    try {
      setSettings(await apiRequest<NimbusDailySettings>("/api/settings"));
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function update<K extends keyof NimbusDailySettings>(key: K, value: NimbusDailySettings[K]) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveSettings() {
    if (!settings) return;
    setIsSaving(true);
    try {
      const nextSettings = await apiRequest<NimbusDailySettings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(nextSettings);
      showToast({ title: text.savedTitle, description: text.savedDesc, tone: "success" });
    } catch (saveError) {
      showToast({ title: text.saveFailed, description: toErrorMessage(saveError), tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingState title={text.loadingTitle} description={text.loadingDesc} />;
  if (error) return <ErrorState title={text.errorTitle} description={error} onRetry={loadSettings} />;
  if (!settings) return <ErrorState title={text.notFoundTitle} description={text.notFoundDesc} onRetry={loadSettings} />;

  const isRealOpenAi = settings.openAiMode === "real";
  const isTelegramOn = settings.telegramMode === "on";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="purple">{text.badge}</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{text.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{text.desc}</p>
        </div>
        <Button disabled={isSaving} onClick={saveSettings}>{isSaving ? text.saving : text.save}</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-cyan-200">OpenAI</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">{text.aiMode}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{text.aiDesc}</p>
            </div>
            <Badge tone={isRealOpenAi ? "green" : "gray"}>{isRealOpenAi ? "Real" : "Mock"}</Badge>
          </div>
          <select className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none" value={settings.openAiMode} onChange={(event) => update("openAiMode", event.target.value as OpenAiMode)}>
            <option value="mock">Mock Mode</option>
            <option value="real">Real OpenAI API</option>
          </select>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-violet-200">Telegram</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">{text.botAlerts}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{text.botDesc}</p>
            </div>
            <Badge tone={isTelegramOn ? "green" : "gray"}>{isTelegramOn ? "On" : "Off"}</Badge>
          </div>
          <select className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none" value={settings.telegramMode} onChange={(event) => update("telegramMode", event.target.value as TelegramMode)}>
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-emerald-200">Scheduler</p>
          <h2 className="mt-4 text-lg font-black text-white">{text.runMode}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">{text.runDesc}</p>
          <select className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none" value={settings.schedulerMode} onChange={(event) => update("schedulerMode", event.target.value as SchedulerMode)}>
            <option value="manual">Manual only</option>
            <option value="daily-cron">Vercel Daily Cron</option>
            <option value="external">External Scheduler</option>
          </select>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-white">{text.runtime}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Timezone</span>
              <select className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none" value={settings.defaultTimezone} onChange={(event) => update("defaultTimezone", event.target.value)}>
                {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">{text.priority}</span>
              <Input max={100} min={0} type="number" value={settings.minDefaultPriorityScore} onChange={(event) => update("minDefaultPriorityScore", Number(event.target.value))} />
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-white">{text.dataSources}</h2>
          <div className="mt-5 space-y-3">
            {sourceKeys.map((key) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-sm font-bold text-slate-200">{text.sourceLabels[key]}</span>
                <input checked={Boolean(settings[key])} className="h-5 w-5 accent-cyan-400" type="checkbox" onChange={(event) => update(key, event.target.checked as never)} />
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-xl font-black text-white">{text.checklist}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {text.checks.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm font-semibold leading-6 text-slate-300">{item}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
