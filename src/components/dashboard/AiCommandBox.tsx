"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const suggestions = [
  "Run my Daily Brief now",
  "Create sale monitor at 9 AM",
  "Show important email notifications",
  "Generate weekend ideas for Saturday",
];

export function AiCommandBox() {
  const [command, setCommand] = useState("Run my Daily Brief now");
  const [response, setResponse] = useState("พร้อมรับคำสั่งแบบ mock — Phase ถัดไปจะต่อ API จริง");

  function handleSubmit() {
    const trimmed = command.trim();

    if (!trimmed) {
      setResponse("กรุณาพิมพ์คำสั่งก่อน เช่น Run my Daily Brief now");
      return;
    }

    setResponse(`Mock command received: “${trimmed}” — ระบบจะต่อเข้ากับ Task Runner ใน Phase 3`);
  }

  return (
    <Card className="relative overflow-hidden border-cyan-300/20 bg-cyan-300/[0.06] p-5 sm:p-6">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-24 left-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative grid gap-5 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">AI Command Box</p>
          <h2 className="mt-3 text-2xl font-black text-white">สั่งรัน Task หรือสร้าง Task ใหม่ด้วยภาษา</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            ตอนนี้เป็น mock interaction สำหรับ UI Foundation ก่อน แต่โครงนี้พร้อมต่อ backend command parser ได้ทันที
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="เช่น Run my Daily Brief now"
            />
            <Button onClick={handleSubmit} type="button">
              Send Command
            </Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-300">
            {response}
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
                onClick={() => setCommand(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
