import type { ScheduledTask } from "@/types/scheduled-task";
import type { DataSourceResult } from "./data-source.service";

export async function fetchSaleUpdates(_task: ScheduledTask): Promise<DataSourceResult> {
  const items = [
    { product: "Power Bank 25000mAh", oldPrice: 1890, currentPrice: 1490, discountPercent: 21 },
    { product: "USB-C PD Cable", oldPrice: 299, currentPrice: 199, discountPercent: 33 },
  ];

  return {
    source: "Product Prices",
    status: "mock",
    title: "Sale Monitor",
    originalContent: items.map((item) => `${item.product}: ${item.oldPrice} -> ${item.currentPrice} discount ${item.discountPercent}%`).join("\n"),
    language: "en",
    items,
    data: items,
  };
}
