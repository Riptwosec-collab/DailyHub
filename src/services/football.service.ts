import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchFootballUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    {
      match: "Team A vs Team B",
      score: "2-1",
      competition: "World Cup Recap",
      highlight: "Late winning goal",
      keyMoment: "Team A scored the winner near full time after sustained pressure.",
      thaiNote: "เกมนี้ควรสรุปเป็นแมตช์ที่มีจังหวะท้ายเกมสำคัญ",
    },
    {
      match: "Team C vs Team D",
      score: "0-0",
      competition: "World Cup Recap",
      highlight: "Strong defensive game",
      keyMoment: "Both teams created chances but the defensive lines controlled the game.",
      thaiNote: "เหมาะกับสรุปเชิงแท็กติก เกมรับเด่น แต่โอกาสจบน้อย",
    },
    {
      match: "Team E vs Team F",
      score: "3-2",
      competition: "World Cup Recap",
      highlight: "Comeback win",
      keyMoment: "Team E came from behind and changed the game with aggressive pressing.",
      thaiNote: "ควรเน้นประเด็น comeback และการเปลี่ยนแท็กติกช่วงครึ่งหลัง",
    },
  ];

  return {
    source: "Football API",
    status: "mock",
    title: "Football Recap",
    originalContent: items
      .map((item) => `${item.match} ${item.score}. ${item.highlight}. ${item.keyMoment}. Thai note: ${item.thaiNote}`)
      .join("\n"),
    language: "mixed",
    items,
    data: items,
  };
}
