"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { showToast } from "@/components/ui/ToastProvider";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { DailyHubSettings, SchedulerMode, TelegramMode, OpenAiMode } from "@/types/settings";

const timezones = ["Asia/Bangkok", "UTC", "Asia/Singapore", "Asia/Tokyo", "America/New_York", "Europe/London"];

export function SettingsView() {
  const [settings, setSettings] = useState<DailyHubSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest<DailyHubSettings>("/api/settings");
      setSettings(data);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function update<K extends keyof DailyHubSettings>(key: K, value: DailyHubSettings[K]) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  }

  async function saveSettings() {
    if (!settings) return;

    setIsSaving(true);
    try {
      const nextSettings = await apiRequest<DailyHubSettings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(nextSettings);
      showToast({ title: "Settings saved", description: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว", tone: "success" });
    } catch (saveError) {
      showToast({ title: "Save failed", description: toErrorMessage(saveError), tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingState title="Loading settings" description="กำลังโหลดการตั้งค่าระบบ" />;

  if (error) {
    return <ErrorState title="Settings loading failed" description={error} onRetry={loadSettings} />;
  }

  if (!settings) {
    return <ErrorState title="Settings not found" description="ไม่พบข้อมูลการตั้งค่าระบบ" onRetry={loadSettings} />;
  }

  const isRealOpenAi = settings.openAiMode === "real";
  const isTelegramOn = settings.telegramMode === "on";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="purple">Phase 27</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Settings</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            ตั้งค่าโหมด OpenAI, Telegram, Scheduler, Timezone และ data sources ก่อนต่อ production จริง
          </p>
        </div>
        <Button disabled={isSaving} onClick={saveSettings}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">OpenAI</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">AI Mode</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">เลือก mock เพื่อทดสอบ หรือ real เมื่อใส่ API key แล้ว</p>
            </div>
            <Badge tone={isRealOpenAi ? "green" : "gray"}>{isRealOpenAi ? "Real" : "Mock"}</Badge>
          </div>
          <select
            className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none"
            value={settings.openAiMode}
            onChange={(event) => update("openAiMode", event.target.value as OpenAiMode)}
          >
            <option value="mock">Mock Mode</option>
            <option value="real">Real OpenAI API</option>
          </select>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-200">Telegram</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Bot Alerts</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">เปิดเมื่อใส่ TELEGRAM_BOT_TOKEN และ TELEGRAM_CHAT_ID แล้ว</p>
            </div>
            <Badge tone={isTelegramOn ? "green" : "gray"}>{isTelegramOn ? "On" : "Off"}</Badge>
          </div>
          <select
            className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none"
            value={settings.telegramMode}
            onChange={(event) => update("telegramMode", event.target.value as TelegramMode)}
          >
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">Scheduler</p>
          <h2 className="mt-4 text-lg font-black text-white">Run Mode</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Hobby Vercel ใช้ daily cron ได้ หรือใช้ external scheduler แทน</p>
          <select
            className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none"
            value={settings.schedulerMode}
            onChange={(event) => update("schedulerMode", event.target.value as SchedulerMode)}
          >
            <option value="manual">Manual only</option>
            <option value="daily-cron">Vercel Daily Cron</option>
            <option value="external">External Scheduler</option>
          </select>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Default Runtime</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Timezone</span>
              <select
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-white outline-none"
                value={settings.defaultTimezone}
                onChange={(event) => update("defaultTimezone", event.target.value)}
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Default Min Priority</span>
              <Input
                max={100}
                min={0}
                type="number"
                value={settings.minDefaultPriorityScore}
                onChange={(event) => update("minDefaultPriorityScore", Number(event.target.value))}
              />
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-white">Data Sources</h2>
          <div className="mt-5 space-y-3">
            {[
              ["enableWebNotifications", "Web Notifications"],
              ["enableNewsDataSource", "News Source"],
              ["enableWeatherDataSource", "Weather Source"],
              ["enableEmailDataSource", "Email Source"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-sm font-bold text-slate-200">{label}</span>
                <input
                  checked={Boolean(settings[key as keyof DailyHubSettings])}
                  className="h-5 w-5 accent-cyan-400"
                  type="checkbox"
                  onChange={(event) => update(key as keyof DailyHubSettings, event.target.checked as never)}
                />
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-xl font-black text-white">Production Checklist</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            "ใส่ Environment Variables ใน Vercel",
            "เช็กว่า .env.local ไม่อยู่ใน GitHub",
            "เปิด Supabase RLS ก่อนใช้จริง",
            "ใช้ external scheduler ถ้าต้องรันถี่กว่า daily",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm font-semibold leading-6 text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
