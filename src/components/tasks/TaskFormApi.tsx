"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest, toErrorMessage } from "@/lib/api-client";
import type { ScheduledTask, ScheduledTaskType, ScheduleType } from "@/types/scheduled-task";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const taskTypes: ScheduledTaskType[] = ["Daily Brief", "Email Monitor", "Sale Monitor", "World Cup Recap", "Weekend Long Read", "Concert Alerts", "Weekend Ideas", "Custom"];
const scheduleTypes: ScheduleType[] = ["One Time", "Hourly", "Daily", "Weekly", "Monthly", "Custom Cron"];
const dataSources = ["News", "Gmail", "Product Prices", "Football API", "Weather API", "Concert API"];
const gptActions = ["Summarize", "Analyze Priority", "Generate Caption", "Generate Image Prompt", "Recommend Action"];
const outputChannels = ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"];

interface FormState {
  name: string;
  type: ScheduledTaskType;
  scheduleType: ScheduleType;
  cronExpression: string;
  time: string;
  timezone: string;
  dataSources: string[];
  gptActions: string[];
  outputChannels: string[];
  minPriorityScore: number;
  isActive: boolean;
}

const initialState: FormState = {
  name: "Morning Daily Brief",
  type: "Daily Brief",
  scheduleType: "Daily",
  cronExpression: "0 8 * * *",
  time: "08:00",
  timezone: "Asia/Bangkok",
  dataSources: ["News", "Weather API"],
  gptActions: ["Summarize", "Analyze Priority", "Recommend Action"],
  outputChannels: ["Save to Web Dashboard", "Save to Notifications"],
  minPriorityScore: 70,
  isActive: true,
};

export function TaskFormApi() {
  const [values, setValues] = useState<FormState>(initialState);
  const [savedTask, setSavedTask] = useState<ScheduledTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cronPreview = useMemo(() => {
    if (values.scheduleType === "Custom Cron") return values.cronExpression;
    if (values.scheduleType === "Hourly") return "0 * * * *";
    const [hour = "0", minute = "0"] = values.time.split(":");
    if (values.scheduleType === "Daily") return `${Number(minute)} ${Number(hour)} * * *`;
    if (values.scheduleType === "Weekly") return `${Number(minute)} ${Number(hour)} * * 6`;
    if (values.scheduleType === "Monthly") return `${Number(minute)} ${Number(hour)} 1 * *`;
    return `One time at ${values.time}`;
  }, [values.scheduleType, values.time, values.cronExpression]);

  function toggleOption(key: "dataSources" | "gptActions" | "outputChannels", option: string) {
    setValues((current) => {
      const exists = current[key].includes(option);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== option) : [...current[key], option],
      };
    });
  }

  function validate() {
    if (values.name.trim().length < 3) return "Task name ต้องมีอย่างน้อย 3 ตัวอักษร";
    if (values.dataSources.length === 0) return "กรุณาเลือก Data Source อย่างน้อย 1 รายการ";
    if (values.gptActions.length === 0) return "กรุณาเลือก GPT Action อย่างน้อย 1 รายการ";
    if (values.outputChannels.length === 0) return "กรุณาเลือก Output Channel อย่างน้อย 1 รายการ";
    if (values.scheduleType === "Custom Cron" && values.cronExpression.trim().split(/\s+/).length < 5) return "Cron expression ต้องมีอย่างน้อย 5 ช่อง";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const task = await apiRequest<ScheduledTask>("/api/scheduled-tasks", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          scheduleType: values.scheduleType,
          cronExpression: cronPreview,
          time: values.scheduleType === "Hourly" || values.scheduleType === "Custom Cron" ? null : values.time,
          timezone: values.timezone,
          dataSources: values.dataSources,
          gptActions: values.gptActions,
          outputChannels: values.outputChannels,
          minPriorityScore: values.minPriorityScore,
          isActive: values.isActive,
        }),
      });
      setSavedTask(task);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative">
          <Badge tone="purple">Phase 17 API Create</Badge>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Create Scheduled Task</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            ฟอร์มนี้ POST ไปที่ /api/scheduled-tasks แล้ว ไม่ใช่ mock state ใน frontend อย่างเดียว
          </p>
        </div>
      </Card>

      {error && (
        <Card className="border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm font-semibold text-rose-100">{error}</Card>
      )}

      {savedTask && (
        <Card className="border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <Badge tone="green">Saved via API</Badge>
          <h2 className="mt-3 text-xl font-black text-white">{savedTask.name}</h2>
          <p className="mt-2 text-sm text-slate-300">Task ID: {savedTask.id}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white" href="/scheduled-tasks">
              Back to Tasks
            </Link>
            <Link className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-bold text-white" href={`/task-results?task_id=${savedTask.id}`}>
              View Results
            </Link>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="text-sm font-bold text-slate-300">Task Name</label>
            <Input className="mt-2" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Task Type" value={values.type} options={taskTypes} onChange={(value) => setValues({ ...values, type: value as ScheduledTaskType })} />
            <Select label="Schedule Type" value={values.scheduleType} options={scheduleTypes} onChange={(value) => setValues({ ...values, scheduleType: value as ScheduleType })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-slate-300">Time</label>
              <Input className="mt-2" type="time" value={values.time} onChange={(event) => setValues({ ...values, time: event.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-300">Timezone</label>
              <Input className="mt-2" value={values.timezone} onChange={(event) => setValues({ ...values, timezone: event.target.value })} />
            </div>
          </div>

          {values.scheduleType === "Custom Cron" && (
            <div>
              <label className="text-sm font-bold text-slate-300">Custom Cron</label>
              <Input className="mt-2" value={values.cronExpression} onChange={(event) => setValues({ ...values, cronExpression: event.target.value })} />
            </div>
          )}

          <OptionGroup title="Data Sources" options={dataSources} selected={values.dataSources} onToggle={(option) => toggleOption("dataSources", option)} />
          <OptionGroup title="GPT Actions" options={gptActions} selected={values.gptActions} onToggle={(option) => toggleOption("gptActions", option)} />
          <OptionGroup title="Output Channels" options={outputChannels} selected={values.outputChannels} onToggle={(option) => toggleOption("outputChannels", option)} />

          <div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-bold text-slate-300">Min Priority Score</label>
              <Badge tone="blue">{values.minPriorityScore}/100</Badge>
            </div>
            <input
              className="mt-3 w-full accent-cyan-300"
              max={100}
              min={0}
              type="range"
              value={values.minPriorityScore}
              onChange={(event) => setValues({ ...values, minPriorityScore: Number(event.target.value) })}
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white">
            <input checked={values.isActive} type="checkbox" onChange={(event) => setValues({ ...values, isActive: event.target.checked })} />
            Active after save
          </label>

          <Button disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save Task via API"}</Button>
        </Card>

        <Card className="h-fit p-5 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">Payload Preview</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm text-slate-400">Cron Preview</p>
            <p className="mt-2 font-mono text-sm font-bold text-cyan-100">{cronPreview}</p>
          </div>
          <pre className="mt-4 max-h-[36rem] overflow-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
            {JSON.stringify({ ...values, cronExpression: cronPreview }, null, 2)}
          </pre>
        </Card>
      </div>
    </form>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-300">{label}</label>
      <select className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-white" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function OptionGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (option: string) => void }) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-300">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"}`}
              onClick={() => onToggle(option)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
