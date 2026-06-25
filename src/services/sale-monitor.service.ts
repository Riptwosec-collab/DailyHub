import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

type ProductRadarItem = {
  product: string;
  category: string;
  region: string;
  innovation: string;
  whyInteresting: string;
  useCase: string;
  audience: string;
  whatToCheck: string[];
  contentIdea: string;
  priorityScore: number;
};

export async function fetchSaleUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items: ProductRadarItem[] = [
    {
      product: "AI Wearable Note Taker",
      category: "AI Productivity Gadget",
      region: "Global / US / Japan",
      innovation: "อุปกรณ์พกพาที่ช่วยจดโน้ต สรุปประชุม และจัด action items",
      whyInteresting: "เหมาะกับคนทำงาน นักเรียน และ creator ที่ต้องสรุปข้อมูลเยอะทุกวัน",
      useCase: "ประชุม สัมภาษณ์ เรียนออนไลน์ เก็บไอเดีย",
      audience: "นักเรียน คนทำงาน creator project manager",
      whatToCheck: ["รองรับภาษาไทย", "คุณภาพสรุป", "แบตเตอรี่", "ค่าใช้จ่ายรายเดือน"],
      contentIdea: "AI gadget ที่เปลี่ยนเสียงประชุมเป็น checklist",
      priorityScore: 94,
    },
    {
      product: "AR Smart Glasses",
      category: "Spatial Computing",
      region: "Global / US / China / EU",
      innovation: "แว่น AR สำหรับแสดงข้อมูลและช่วยงานแบบ hands-free",
      whyInteresting: "AR เริ่มถูกใช้ในงานเรียนรู้ งานภาคสนาม และ workflow จริงมากขึ้น",
      useCase: "training, field work, documentation, remote workflow",
      audience: "engineer technician student creator",
      whatToCheck: ["น้ำหนัก", "ความสว่าง", "แบตเตอรี่", "แอปที่รองรับ"],
      contentIdea: "แว่น AR จะช่วยงาน IT ภาคสนามได้อย่างไร",
      priorityScore: 88,
    },
    {
      product: "E-Ink Desk Dashboard",
      category: "Smart Desk",
      region: "Global / EU / Japan",
      innovation: "จอ e-ink สำหรับแสดงงาน ตารางเวลา สภาพอากาศ และ habit",
      whyInteresting: "ประหยัดไฟ อ่านง่าย และช่วยลดการเปิดมือถือระหว่างทำงาน",
      useCase: "โต๊ะทำงาน ห้องนอน dashboard ส่วนตัว",
      audience: "สาย productivity นักเรียน คนทำงาน smart home user",
      whatToCheck: ["ภาษาไทย", "การเชื่อม calendar", "แบตเตอรี่", "API"],
      contentIdea: "Dashboard ที่ไม่ต้องเปิดมือถือ",
      priorityScore: 86,
    },
    {
      product: "AI Energy Monitor",
      category: "Smart Home / Energy Tech",
      region: "Global / US / EU",
      innovation: "ระบบช่วยวิเคราะห์การใช้ไฟและแนะนำวิธีประหยัดพลังงาน",
      whyInteresting: "ช่วยให้คนเห็นภาพการใช้ไฟในบ้านและจัดการค่าใช้จ่ายได้ดีขึ้น",
      useCase: "บ้าน คอนโด home office",
      audience: "คนอยู่คอนโด เจ้าของบ้าน smart home user",
      whatToCheck: ["รองรับไฟในประเทศ", "วิธีติดตั้ง", "แอป", "ราคา"],
      contentIdea: "AI ช่วยลดค่าไฟได้จริงไหม",
      priorityScore: 82,
    },
    {
      product: "Portable Dual-Screen Monitor",
      category: "Remote Work Setup",
      region: "Global / China / US",
      innovation: "จอเสริมพกพาสำหรับทำงานหลายหน้าจอ",
      whyInteresting: "คนทำงานนอกบ้านและสาย coding ต้องการพื้นที่ทำงานมากขึ้นโดยไม่เพิ่มน้ำหนักมาก",
      useCase: "coding dashboard spreadsheet stock watchlist",
      audience: "developer analyst student digital nomad",
      whatToCheck: ["ความสว่าง", "น้ำหนัก", "USB-C", "ขาตั้ง"],
      contentIdea: "เปลี่ยนโน้ตบุ๊กให้เป็น mini command center",
      priorityScore: 84,
    },
    {
      product: "Personal AI Knowledge Base",
      category: "AI Software / Productivity",
      region: "Global / US / EU",
      innovation: "แอปที่รวมไฟล์ โน้ต และอีเมล เพื่อค้นหาและสรุปด้วย AI",
      whyInteresting: "ช่วยลดปัญหาข้อมูลกระจัดกระจายและทำให้ค้นความรู้ส่วนตัวได้ง่ายขึ้น",
      useCase: "เรียน ทำโปรเจกต์ research meeting memory",
      audience: "student researcher developer creator",
      whatToCheck: ["export data", "ภาษาไทย", "ราคา", "integration"],
      contentIdea: "ทำสมองที่สองด้วย AI",
      priorityScore: 85,
    },
  ];

  return {
    source: "Global Innovation Product Radar",
    status: "mock",
    title: "สินค้าเทคโนโลยีและนวัตกรรมที่น่าสนใจจากทั่วโลก",
    originalContent: items.map((item) => `${item.product} | ${item.category} | ${item.region} | ${item.innovation} | ${item.whyInteresting}`).join("\n\n"),
    language: "th",
    items,
    data: {
      scope: "global technology and innovation products",
      items,
    },
  };
}
