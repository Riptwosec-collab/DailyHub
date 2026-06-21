import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchSaleUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    {
      product: "Power Bank 25000mAh PD 145W",
      store: "Shopee Mall",
      oldPrice: 1890,
      currentPrice: 1490,
      discountPercent: 21,
      reason: "เหมาะกับมือถือ แท็บเล็ต และโน้ตบุ๊ก USB-C",
      action: "น่ากดดู ถ้าราคานี้รวมคูปองและประกันร้านทางการ",
      url: "https://shopee.co.th/search?keyword=power%20bank%2025000mah%20145w",
    },
    {
      product: "USB-C PD Cable 100W",
      store: "Accessory Store",
      oldPrice: 299,
      currentPrice: 199,
      discountPercent: 33,
      reason: "เหมาะกับชาร์จเร็วและใช้คู่กับ power bank / notebook",
      action: "คุ้มถ้ารองรับ PD 100W จริงและมีรีวิวดี",
      url: "https://shopee.co.th/search?keyword=usb-c%20pd%20100w%20cable",
    },
    {
      product: "ANC Wireless Earbuds",
      store: "Audio Deals",
      oldPrice: 2490,
      currentPrice: 1790,
      discountPercent: 28,
      reason: "เหมาะกับเดินทาง ทำงาน และฟังเพลงแบบตัดเสียงรบกวน",
      action: "รอเช็กรีวิวเรื่อง ANC, battery และ latency ก่อนซื้อ",
      url: "https://shopee.co.th/search?keyword=anc%20wireless%20earbuds",
    },
  ];

  return {
    source: "Product Prices",
    status: "mock",
    title: "Sale Monitor",
    originalContent: items
      .map(
        (item) =>
          `${item.product} from ${item.store}: ${item.oldPrice} -> ${item.currentPrice} THB, discount ${item.discountPercent}%. Reason: ${item.reason}. Action: ${item.action}`,
      )
      .join("\n"),
    language: "mixed",
    items,
    data: items,
  };
}
