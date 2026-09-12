import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

const now = new Date().toISOString();

const lifestyleIdeas = [
  {
    title: "ร้านอาหารและคาเฟ่ใกล้ตัวสำหรับวันหยุด",
    category: "Restaurant / Cafe",
    description: "คัดไอเดียร้านอาหาร คาเฟ่ บุฟเฟ่ต์ และจุดนั่งพักที่เหมาะกับการวางแผนวันหยุดหรือหลังเลิกงาน",
    whyInteresting: "ช่วยให้ Daily Brief มีหมวดไลฟ์สไตล์ที่ใช้งานจริง ไม่ปนกับข่าวยาวเดิม",
    targetUser: "ผู้ใช้ที่อยากหาอะไรกินหรือหาที่พักผ่อนเร็ว ๆ",
    action: "เปิดอ่านรายละเอียดแล้วเลือกพิกัดที่เหมาะกับเวลาและงบ",
    publishedAt: now,
  },
  {
    title: "กิจกรรมวันหยุดและอีเวนต์ใกล้ตัว",
    category: "Weekend Activities",
    description: "รวมแนวคิดกิจกรรมสั้น ๆ เช่น เดินห้าง ดูหนัง คาเฟ่ ถ่ายรูป เดินเล่น หรืออีเวนต์ในเมือง",
    whyInteresting: "ใช้แทน Weekend Long Read โดยเน้นใช้งานง่ายและไม่ทำให้ Telegram ยาวเกินไป",
    targetUser: "ผู้ใช้ที่อยากได้แผนพักผ่อนแบบเร็ว",
    action: "เลือกกิจกรรมที่เปิดอยู่และเดินทางง่ายที่สุด",
    publishedAt: now,
  },
  {
    title: "Hidden Gem / Local Spot",
    category: "Local Discovery",
    description: "พื้นที่สำหรับแนะนำจุดน่าสนใจ ร้านท้องถิ่น และกิจกรรมเบา ๆ ที่ไม่ใช่ chain ใหญ่",
    whyInteresting: "ต่อยอดกับระบบ Around My Dorm และร้านใกล้หอได้",
    targetUser: "ผู้ใช้ที่ชอบร้านท้องถิ่นและจุดถ่ายรูป",
    action: "บันทึกร้านหรือพิกัดไว้ดูภายหลัง",
    publishedAt: now,
  },
];

export async function fetchLifestyleIdeasInput(task: ScheduledTask): Promise<DataSourceResult> {
  const text = lifestyleIdeas
    .map((idea, index) => `${index + 1}. ${idea.title} — ${idea.description} | ${idea.whyInteresting}`)
    .join("\n");

  return {
    source: "Lifestyle Ideas",
    status: "mock",
    title: task.name || "ไอเดียวันหยุด / ไลฟ์สไตล์",
    data: {
      task: task.name,
      generatedAt: now,
      ideas: lifestyleIdeas,
    },
    originalContent: text,
    language: "th",
    items: lifestyleIdeas,
  };
}
