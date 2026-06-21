"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  buildCronPreview,
  buildMockScheduledTask,
  dataSourceOptions,
  gptActionOptions,
  hasErrors,
  initialCreateTaskFormValues,
  outputChannelOptions,
  scheduleTypes,
  taskTypes,
  timezones,
  validateCreateTaskForm,
  type CreateTaskFormErrors,
  type CreateTaskFormValues,
} from "@/lib/validators";
import { cn, formatDateTime } from "@/lib/utils";
import type { ScheduleType, ScheduledTaskType } from "@/types/scheduled-task";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {children}
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-semibold text-rose-200">{message}</p>;
}

function SelectField({
  value,
  onChange,
  options,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
}) {
  return (
    <div>
      <select
        className={cn(
          "h-12 w-full rounded-2xl border bg-slate-950/55 px-4 text-sm font-semibold text-white shadow-inner shadow-black/20 outline-none transition focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10",
          error ? "border-rose-300/40" : "border-white/10",
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

function MultiSelectCards({
  options,
  values,
  onToggle,
  error,
}: {
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => {
          const isSelected = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-2xl border p-4 text-left text-sm font-bold transition active:scale-[0.99]",
                isSelected
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.07]",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border text-[10px]",
                    isSelected ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/20 bg-slate-950/40",
                  )}
                >
                  {isSelected ? "✓" : ""}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function JsonPreview({ value }: { value: unknown }) {
  return (
    <pre className="max-h-[32rem] overflow-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-cyan-50 shadow-inner shadow-black/30">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function TaskForm() {
  const [values, setValues] = useState<CreateTaskFormValues>(initialCreateTaskFormValues);
  const [errors, setErrors] = useState<CreateTaskFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedTask, setSavedTask] = useState<ReturnType<typeof buildMockScheduledTask> | null>(null);
  const [statusMessage, setStatusMessage] = useState("Phase 4 เป็น mock form ก่อน กด Save Task เพื่อ validate และ preview payload");

  const cronPreview = useMemo(() => buildCronPreview(values), [values]);
  const previewTask = useMemo(() => buildMockScheduledTask(values), [values]);

  function update<K extends keyof CreateTaskFormValues>(key: K, value: CreateTaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  function toggleArrayValue(key: "dataSources" | "gptActions" | "outputChannels", value: string) {
    setValues((current) => {
      const exists = current[key].includes(value);
      const nextValues = exists ? current[key].filter((item) => item !== value) : [...current[key], value];

      return { ...current, [key]: nextValues };
    });
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCreateTaskForm(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setStatusMessage("ยังบันทึกไม่ได้ กรุณาแก้ข้อมูลที่เป็นสีแดงก่อน");
      return;
    }

    setIsSaving(true);
    setStatusMessage("กำลังจำลองการบันทึก Scheduled Task...");

    window.setTimeout(() => {
      const task = buildMockScheduledTask(values);
      setSavedTask(task);
      setIsSaving(false);
      setStatusMessage(`Save Task สำเร็จแบบ mock: ${task.name} — Phase 7 จะเชื่อม POST /api/scheduled-tasks`);
    }, 650);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-stretch">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <Badge tone="purple">Phase 4 Create Task Form</Badge>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">Create Scheduled Task</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              สร้าง Task สำหรับ Nimbus Daily โดยเลือก schedule, data sources, GPT actions, output channels และ min priority score เพื่อเตรียมต่อ Mock API ใน Phase 7
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold text-slate-400">Form Status</p>
          <h2 className="mt-3 text-xl font-black text-white">Mock Save Ready</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{statusMessage}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="blue">Cron: {cronPreview}</Badge>
            <Badge tone={values.isActive ? "green" : "gray"}>{values.isActive ? "Active" : "Paused"}</Badge>
            <Badge tone="purple">Priority {values.minPriorityScore}/100</Badge>
          </div>
        </Card>
      </section>

      <form className="grid gap-6 xl:grid-cols-[1fr_420px] xl:items-start" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Section title="1. Task Info" description="ตั้งชื่อและเลือกประเภทงานที่ต้องการให้ GPT ช่วยประมวลผล">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-white">Task Name</label>
                <Input
                  className={errors.name ? "border-rose-300/40" : undefined}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="เช่น Morning Daily Brief"
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">Task Type</label>
                <SelectField
                  value={values.type}
                  options={taskTypes}
                  error={errors.type}
                  onChange={(value) => update("type", value as ScheduledTaskType)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">Timezone</label>
                <SelectField
                  value={values.timezone}
                  options={timezones}
                  error={errors.timezone}
                  onChange={(value) => update("timezone", value)}
                />
              </div>
            </div>
          </Section>

          <Section title="2. Schedule" description="กำหนดรอบเวลารัน Task เช่น Hourly, Daily, Weekly หรือ Custom Cron">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Schedule Type</label>
                <SelectField
                  value={values.scheduleType}
                  options={scheduleTypes}
                  error={errors.scheduleType}
                  onChange={(value) => update("scheduleType", value as ScheduleType)}
                />
              </div>

              {values.scheduleType === "One Time" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">Date</label>
                  <Input
                    className={errors.date ? "border-rose-300/40" : undefined}
                    type="date"
                    value={values.date}
                    onChange={(event) => update("date", event.target.value)}
                  />
                  <FieldError message={errors.date} />
                </div>
              )}

              {values.scheduleType !== "Hourly" && values.scheduleType !== "Custom Cron" && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">Time</label>
                  <Input
                    className={errors.time ? "border-rose-300/40" : undefined}
                    type="time"
                    value={values.time}
                    onChange={(event) => update("time", event.target.value)}
                  />
                  <FieldError message={errors.time} />
                </div>
              )}

              {values.scheduleType === "Custom Cron" && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-white">Custom Cron Expression</label>
                  <Input
                    className={errors.cronExpression ? "border-rose-300/40" : undefined}
                    value={values.cronExpression}
                    onChange={(event) => update("cronExpression", event.target.value)}
                    placeholder="0 8 * * *"
                  />
                  <FieldError message={errors.cronExpression} />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-sm text-slate-300">
              Cron Preview: <span className="font-black text-cyan-100">{cronPreview}</span>
            </div>
          </Section>

          <Section title="3. Data Sources" description="เลือกแหล่งข้อมูลที่จะให้ backend ดึงมาก่อนส่งเข้า GPT">
            <MultiSelectCards
              options={dataSourceOptions}
              values={values.dataSources}
              onToggle={(value) => toggleArrayValue("dataSources", value)}
              error={errors.dataSources}
            />
          </Section>

          <Section title="4. GPT Actions" description="เลือกสิ่งที่ต้องการให้ GPT ทำกับข้อมูล เช่น สรุป วิเคราะห์คะแนน หรือสร้างคอนเทนต์">
            <MultiSelectCards
              options={gptActionOptions}
              values={values.gptActions}
              onToggle={(value) => toggleArrayValue("gptActions", value)}
              error={errors.gptActions}
            />
          </Section>

          <Section title="5. Output Channels" description="เลือกว่าจะบันทึกผลไว้ที่ไหน และจะส่ง Telegram หรือไม่">
            <MultiSelectCards
              options={outputChannelOptions}
              values={values.outputChannels}
              onToggle={(value) => toggleArrayValue("outputChannels", value)}
              error={errors.outputChannels}
            />
          </Section>

          <Section title="6. Alert Rules" description="ตั้งค่าเกณฑ์คะแนนสำคัญขั้นต่ำและสถานะเริ่มต้นของ Task">
            <div className="grid gap-5 md:grid-cols-[1fr_220px] md:items-center">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-white">Min Priority Score</label>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-black text-cyan-100">
                    {values.minPriorityScore}/100
                  </span>
                </div>
                <input
                  className="mt-4 w-full accent-cyan-300"
                  type="range"
                  min="0"
                  max="100"
                  value={values.minPriorityScore}
                  onChange={(event) => update("minPriorityScore", Number(event.target.value))}
                />
                <FieldError message={errors.minPriorityScore} />
              </div>

              <button
                type="button"
                onClick={() => update("isActive", !values.isActive)}
                className={cn(
                  "rounded-3xl border p-5 text-left transition",
                  values.isActive
                    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-50"
                    : "border-slate-300/20 bg-slate-300/10 text-slate-200",
                )}
              >
                <p className="text-sm font-black">{values.isActive ? "Active on save" : "Save as paused"}</p>
                <p className="mt-2 text-xs leading-5 opacity-75">
                  {values.isActive ? "Task จะเริ่มถูก scheduler ตรวจในอนาคต" : "Task จะยังไม่ถูกรันจนกว่าจะ Resume"}
                </p>
              </button>
            </div>
          </Section>

          <Card className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/scheduled-tasks" className="text-sm font-bold text-slate-300 hover:text-white">
                ← Back to Scheduled Tasks
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => setValues(initialCreateTaskFormValues)}>
                  Reset
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Task"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-400">Task Preview</p>
                <h2 className="mt-2 text-xl font-black text-white">{previewTask.name}</h2>
              </div>
              <Badge tone={previewTask.isActive ? "green" : "gray"}>{previewTask.status}</Badge>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-white">{previewTask.type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Schedule</span>
                <span className="font-bold text-white">{previewTask.scheduleType}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Next Run</span>
                <span className="text-right font-bold text-cyan-100">{formatDateTime(previewTask.nextRunAt)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {previewTask.dataSources.map((item) => (
                <Badge key={item} tone="blue">
                  {item}
                </Badge>
              ))}
              {previewTask.outputChannels.includes("Send Telegram") && <Badge tone="purple">Telegram</Badge>}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-400">Payload Preview</p>
            <div className="mt-4">
              <JsonPreview value={previewTask} />
            </div>
          </Card>

          {savedTask && (
            <Card className="border-emerald-300/20 bg-emerald-300/[0.06] p-5">
              <Badge tone="green">Mock Saved</Badge>
              <h3 className="mt-4 text-lg font-black text-white">{savedTask.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Task ถูก validate และสร้าง payload สำเร็จแล้ว แต่ยังไม่บันทึกลง API จริงจนกว่าจะทำ Phase 7
              </p>
              <Link
                href="/scheduled-tasks"
                className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Go to Scheduled Tasks
              </Link>
            </Card>
          )}
        </aside>
      </form>
    </div>
  );
}
