import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchConcertUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    {
      artist: "Mock Artist",
      city: "Bangkok",
      date: "2026-08-01",
      venue: "Impact Arena",
      genre: "Indie Pop",
      ticketStatus: "Coming soon",
      action: "ตั้ง reminder วันเปิดขายบัตรและเช็กผังที่นั่ง",
      url: "https://www.thaiticketmajor.com/",
    },
    {
      artist: "Synth Pop Live",
      city: "Bangkok",
      date: "2026-08-15",
      venue: "Union Hall",
      genre: "Synth Pop",
      ticketStatus: "Early bird available",
      action: "น่ากดดูถ้าราคาบัตร early bird ยังเหลือ",
      url: "https://www.thaiticketmajor.com/",
    },
    {
      artist: "Jazz Weekend",
      city: "Bangkok",
      date: "2026-09-05",
      venue: "Lido Connect",
      genre: "Jazz",
      ticketStatus: "Announced",
      action: "บันทึกไว้เป็นตัวเลือกวันหยุด บรรยากาศเหมาะกับชิล ๆ",
      url: "https://www.thaiticketmajor.com/",
    },
  ];

  return {
    source: "Concert API",
    status: "mock",
    title: "Concert Alerts",
    originalContent: items
      .map(
        (item) =>
          `${item.artist} in ${item.city} at ${item.venue} on ${item.date}. Genre: ${item.genre}. Ticket: ${item.ticketStatus}. Action: ${item.action}`,
      )
      .join("\n"),
    language: "mixed",
    items,
    data: items,
  };
}
