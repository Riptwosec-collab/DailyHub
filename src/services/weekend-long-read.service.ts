import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchWeekendLongReadUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    {
      articleTitle: "AI agents กับการทำงานอัตโนมัติในชีวิตประจำวัน",
      topic: "AI / Productivity",
      readTime: "15-20 นาที",
      why: "ช่วยเข้าใจว่า AI agents จะช่วยจัดการงานซ้ำ ๆ และวางระบบ workflow ส่วนตัวได้อย่างไร",
      action: "บันทึกไว้อ่านช่วงเช้าวันหยุด แล้วจด 3 ไอเดียที่นำไปใช้กับโปรเจกต์ของตัวเอง",
      sourceUrl: "https://example.com/ai-agents-long-read",
    },
    {
      articleTitle: "ออกแบบระบบ Productivity Dashboard ให้ใช้งานได้จริง",
      topic: "Productivity Systems",
      readTime: "10-15 นาที",
      why: "เหมาะกับต่อยอด Nimbus Daily ให้เป็นระบบสรุปงานและแจ้งเตือนที่ใช้จริงทุกวัน",
      action: "อ่านแล้วแยกเป็น checklist สำหรับปรับหน้า Dashboard และ Scheduled Tasks",
      sourceUrl: "https://example.com/productivity-dashboard-guide",
    },
    {
      articleTitle: "Cloud automation สำหรับคนทำ IT และ Network Engineer",
      topic: "Cloud / Automation",
      readTime: "12-18 นาที",
      why: "ช่วยเชื่อมภาพรวม GitHub Actions, Scheduler, API route และ notification workflow เข้าด้วยกัน",
      action: "อ่านเพื่อวาง roadmap ฟีเจอร์ automation ถัดไปของ Nimbus Daily",
      sourceUrl: "https://example.com/cloud-automation-network-engineer",
    },
  ];

  return {
    source: "Weekend Long Read",
    status: "mock",
    title: "Weekend Long Read Picks",
    originalContent: items
      .map((item) => `${item.articleTitle}. Topic: ${item.topic}. Read time: ${item.readTime}. Why: ${item.why}. Action: ${item.action}`)
      .join("\n"),
    language: "mixed",
    items,
    data: {
      theme: "อ่านยาววันหยุด",
      target: "AI, productivity, automation, cloud operations",
      articles: items,
    },
  };
}
