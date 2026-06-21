import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchWeekendIdeasInput(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    {
      idea: "Morning cafe + photo walk",
      location: "Bangkok old town",
      budget: "300-700 THB",
      mood: "relaxing",
      bestTime: "08:30-11:00",
      why: "แสงเช้าถ่ายรูปสวย อากาศยังไม่ร้อนมาก และเดินต่อได้หลายจุด",
    },
    {
      idea: "Short trip to Bang Pu",
      location: "Samut Prakan",
      budget: "200-600 THB",
      mood: "easy outdoor",
      bestTime: "16:30-18:30",
      why: "เหมาะกับเดินเล่น ถ่ายพระอาทิตย์ตก และไม่ต้องเดินทางไกลจากกรุงเทพ",
    },
    {
      idea: "Weekend long read session",
      location: "Home or quiet cafe",
      budget: "0-300 THB",
      mood: "productive chill",
      bestTime: "10:00-12:00",
      why: "เหมาะกับอ่านบทความยาว วางแผนโปรเจกต์ และพักสมองแบบไม่เหนื่อย",
    },
  ];

  return {
    source: "Weekend Ideas",
    status: "mock",
    title: "Weekend Ideas",
    originalContent: items
      .map((item) => `${item.idea} at ${item.location}. Budget: ${item.budget}. Best time: ${item.bestTime}. Why: ${item.why}`)
      .join("\n"),
    language: "mixed",
    items,
    data: {
      preferences: ["cafe", "photo spots", "short trip", "budget friendly", "long read"],
      location: "Bangkok",
      mood: "relaxing",
      ideas: items,
    },
  };
}
