import type { ScheduledTask } from "@/types/scheduled-task";

export type BatchId = "one" | "two" | "three" | "four" | "all";

export type TaskSeed = {
  key: string;
  label: string;
  name: string;
  type: ScheduledTask["type"];
  scheduleType: ScheduledTask["scheduleType"];
  cronExpression: string;
  time: string | null;
  dataSources: string[];
  gptActions: string[];
  minPriorityScore: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export const DEFAULT_TASK_SEEDS: TaskSeed[] = [
  { key: "daily-brief", label: "Daily Brief / ข่าวประจำวัน", name: "Daily Brief / ข่าวประจำวัน", type: "Daily Brief", scheduleType: "Daily", cronExpression: "0 8 * * *", time: "08:00", dataSources: ["NewsData.io", "Weather API", "Gmail Daily Digest"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 70 },
  { key: "thai-news", label: "ข่าวไทยวันนี้", name: "ข่าวไทยวันนี้", type: "Daily Brief", scheduleType: "Daily", cronExpression: "5 8 * * *", time: "08:05", dataSources: ["NewsData.io", "Thailand News"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 65 },
  { key: "public-notices", label: "ประกาศสำคัญ / แจ้งเตือนรัฐ", name: "ประกาศสำคัญ / แจ้งเตือนรัฐ", type: "Daily Brief", scheduleType: "Daily", cronExpression: "7 8 * * *", time: "08:07", dataSources: ["NewsData.io", "Thailand Public Notices", "Government Alerts"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 75 },
  { key: "world-news", label: "ข่าวต่างประเทศ", name: "ข่าวต่างประเทศ", type: "Daily Brief", scheduleType: "Daily", cronExpression: "10 8 * * *", time: "08:10", dataSources: ["World News", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 65 },
  { key: "ai-tech", label: "AI / Tech Update", name: "AI / Tech Update", type: "Daily Brief", scheduleType: "Daily", cronExpression: "15 8 * * *", time: "08:15", dataSources: ["NewsData.io", "AI Tech News"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 70 },
  { key: "cybersecurity", label: "Cybersecurity Alert", name: "Cybersecurity Alert", type: "Daily Brief", scheduleType: "Daily", cronExpression: "20 8 * * *", time: "08:20", dataSources: ["NewsData.io", "Cybersecurity News"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 80 },
  { key: "network-cloud", label: "Network / Cloud News", name: "Network / Cloud News", type: "Daily Brief", scheduleType: "Daily", cronExpression: "25 8 * * *", time: "08:25", dataSources: ["NewsData.io", "Network Cloud News"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 70 },
  { key: "market-crypto", label: "หุ้น / ตลาด / Crypto", name: "หุ้น / ตลาด / Crypto", type: "US Stock News", scheduleType: "Daily", cronExpression: "0 7 * * 1-5", time: "07:00", dataSources: ["US Stock News", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 60 },
  { key: "weather-pm25", label: "อากาศ / PM2.5", name: "อากาศ / PM2.5", type: "Daily Brief", scheduleType: "Daily", cronExpression: "30 7 * * *", time: "07:30", dataSources: ["Weather API", "PM2.5", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 55 },
  { key: "traffic", label: "เดินทาง / จราจร", name: "เดินทาง / จราจร", type: "Daily Brief", scheduleType: "Daily", cronExpression: "35 7 * * *", time: "07:35", dataSources: ["NewsData.io", "Traffic Alerts"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 55 },
  { key: "bts-mrt-alerts", label: "BTS/MRT ขัดข้อง", name: "BTS/MRT ขัดข้อง", type: "Public Alerts", scheduleType: "Daily", cronExpression: "37 7 * * *", time: "07:37", dataSources: ["NewsData.io", "BTS MRT Alerts", "Transit Status", "Public Notices"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 70 },
  { key: "today-tasks", label: "งานวันนี้", name: "งานวันนี้", type: "Daily Brief", scheduleType: "Daily", cronExpression: "40 7 * * *", time: "07:40", dataSources: ["Scheduler", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 50 },
  { key: "important-email", label: "อีเมลสำคัญ", name: "อีเมลสำคัญ", type: "Email Monitor", scheduleType: "Hourly", cronExpression: "*/30 * * * *", time: null, dataSources: ["Gmail Daily Digest"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 70 },
  { key: "sports-football", label: "กีฬา / ฟุตบอล", name: "กีฬา / ฟุตบอล", type: "World Cup Recap", scheduleType: "Daily", cronExpression: "0 23 * * *", time: "23:00", dataSources: ["Football News Hub", "NewsData.io"], gptActions: ["Summarize", "Generate Caption", "Recommend Action"], minPriorityScore: 65 },
  { key: "events-products", label: "อีเวนต์ / คอนเสิร์ต / สินค้าใหม่", name: "อีเวนต์ / คอนเสิร์ต / สินค้าใหม่", type: "Concert Alerts", scheduleType: "Daily", cronExpression: "0 20 * * *", time: "20:00", dataSources: ["Concert API Thailand Only", "Global Innovation Product Radar", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 75 },
  { key: "deals-promos", label: "ดีล / โปรโมชัน", name: "ดีล / โปรโมชัน", type: "Sale Monitor", scheduleType: "Daily", cronExpression: "0 10 * * *", time: "10:00", dataSources: ["Product Prices", "Global Innovation Product Radar", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 55 },
  { key: "travel-deals", label: "โปรเดินทาง / ตั๋วเครื่องบิน / โรงแรม", name: "โปรเดินทาง / ตั๋วเครื่องบิน / โรงแรม", type: "Travel Deals", scheduleType: "Daily", cronExpression: "0 11 * * *", time: "11:00", dataSources: ["Flight Deals", "Hotel Deals", "Travel Promotions", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 60 },
  { key: "lifestyle-ideas", label: "ไอเดียวันหยุด / ไลฟ์สไตล์", name: "ไอเดียวันหยุด / ไลฟ์สไตล์", type: "Lifestyle Ideas", scheduleType: "Daily", cronExpression: "0 9 * * 6,0", time: "09:00", dataSources: ["Lifestyle Ideas", "Restaurant/Cafe Watch", "Weekend Activities", "NewsData.io"], gptActions: ["Summarize", "Analyze Priority", "Recommend Action"], minPriorityScore: 55 },
];

export const EXPECTED_DEFAULT_TASK_COUNT = DEFAULT_TASK_SEEDS.length;

const BATCH_ONE_KEYS = ["daily-brief", "thai-news", "public-notices", "world-news", "ai-tech"];
const BATCH_TWO_KEYS = ["cybersecurity", "network-cloud", "market-crypto", "weather-pm25"];
const BATCH_THREE_KEYS = ["traffic", "bts-mrt-alerts", "today-tasks", "important-email", "sports-football"];
const BATCH_FOUR_KEYS = ["events-products", "deals-promos", "travel-deals", "lifestyle-ideas"];

export function getDefaultTaskKeys(batch: BatchId) {
  if (batch === "one") return BATCH_ONE_KEYS;
  if (batch === "two") return BATCH_TWO_KEYS;
  if (batch === "three") return BATCH_THREE_KEYS;
  if (batch === "four") return BATCH_FOUR_KEYS;
  return [...BATCH_ONE_KEYS, ...BATCH_TWO_KEYS, ...BATCH_THREE_KEYS, ...BATCH_FOUR_KEYS];
}

export function getDefaultTaskSeeds(batch: BatchId = "all") {
  const keys = new Set(getDefaultTaskKeys(batch));
  return DEFAULT_TASK_SEEDS.filter((task) => keys.has(task.key));
}

export function isLegacyLongReadText(value: string) {
  return /long\s*read|อ่านยาว|weekend\s*long\s*read/i.test(value);
}

export function isLegacyLongReadTask(task: Pick<ScheduledTask, "name" | "type" | "dataSources">) {
  return isLegacyLongReadText([task.name, task.type, task.dataSources.join(" ")].join(" "));
}

function includesAny(text: string, pattern: RegExp) {
  return pattern.test(text.toLowerCase());
}

export function matchesDefaultTaskSeed(task: Pick<ScheduledTask, "name" | "type" | "dataSources" | "gptActions">, seed: TaskSeed) {
  if (isLegacyLongReadText([task.name, task.type, task.dataSources.join(" ")].join(" "))) return false;

  const name = task.name.toLowerCase();
  const text = [task.name, task.type, task.dataSources.join(" "), task.gptActions.join(" ")].join(" ").toLowerCase();

  if (name === seed.name.toLowerCase()) return true;
  if (seed.key === "daily-brief") return includesAny(text, /morning daily brief|daily brief|ข่าวประจำวัน|สรุปประจำวัน/);
  if (seed.key === "thai-news") return includesAny(text, /ข่าวไทย|thailand news|thai news/);
  if (seed.key === "public-notices") return includesAny(text, /ประกาศสำคัญ|แจ้งเตือนรัฐ|government alerts|public notices/);
  if (seed.key === "world-news") return includesAny(text, /ข่าวต่างประเทศ|world news|global news/);
  if (seed.key === "ai-tech") return includesAny(text, /ai tech|openai|google ai|developer tools|เทคโนโลยี/);
  if (seed.key === "cybersecurity") return includesAny(text, /cybersecurity|security advisory|cve|malware|phishing|ไซเบอร์/);
  if (seed.key === "network-cloud") return includesAny(text, /network cloud|aws|azure|cloudflare|cisco|fortinet|infrastructure/);
  if (seed.key === "market-crypto") return task.type === "US Stock News" || includesAny(text, /us stock news|หุ้น|market|crypto|bitcoin|gold/);
  if (seed.key === "weather-pm25") return includesAny(text, /weather|pm2\.5|อากาศ|ฝุ่น|ฝน/);
  if (seed.key === "traffic") return includesAny(text, /traffic|จราจร|รถติด|เดินทาง/);
  if (seed.key === "bts-mrt-alerts") return task.type === "Public Alerts" || includesAny(text, /bts|mrt|transit|รถไฟฟ้า/);
  if (seed.key === "today-tasks") return includesAny(text, /today tasks|scheduler|งานวันนี้|scheduled tasks/);
  if (seed.key === "important-email") return task.type === "Email Monitor" && includesAny(text, /email|gmail|อีเมล/);
  if (seed.key === "sports-football") return task.type === "World Cup Recap" || includesAny(text, /football|soccer|ฟุตบอล|กีฬา/);
  if (seed.key === "events-products") return task.type === "Concert Alerts" || includesAny(text, /concert|คอนเสิร์ต|อีเวนต์|event/);
  if (seed.key === "deals-promos") return task.type === "Sale Monitor" && includesAny(text, /deal|promo|โปร|สินค้า|discount/);
  if (seed.key === "travel-deals") return task.type === "Travel Deals" || includesAny(text, /flight|hotel|travel|ตั๋วเครื่องบิน|โรงแรม|โปรเดินทาง|ท่องเที่ยว/);
  if (seed.key === "lifestyle-ideas") return task.type === "Lifestyle Ideas" || includesAny(text, /lifestyle|restaurant|cafe|weekend activities|ร้านอาหาร|คาเฟ่|บุฟเฟ่ต์|ไลฟ์สไตล์|วันหยุด|ที่เที่ยว/);

  return false;
}

function nextRunFor(scheduleType: ScheduledTask["scheduleType"], time: string | null) {
  const now = new Date();
  if (scheduleType === "One Time") return null;
  if (scheduleType === "Hourly") return new Date(now.getTime() + HOUR_MS).toISOString();

  const next = new Date(now.getTime() + DAY_MS);
  if (time) {
    const [hour = "8", minute = "0"] = time.split(":");
    next.setHours(Number(hour), Number(minute), 0, 0);
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}

export function buildDefaultScheduledTask(seed: TaskSeed, userId = "user_001", index = 0): ScheduledTask {
  const now = Date.now();
  const createdAt = new Date(now - (EXPECTED_DEFAULT_TASK_COUNT - index) * HOUR_MS).toISOString();
  const updatedAt = new Date(now - Math.max(1, EXPECTED_DEFAULT_TASK_COUNT - index) * 5 * 60_000).toISOString();

  return {
    id: `default_${seed.key}`,
    userId,
    name: seed.name,
    type: seed.type,
    scheduleType: seed.scheduleType,
    cronExpression: seed.cronExpression,
    time: seed.time,
    timezone: "Asia/Bangkok",
    dataSources: seed.dataSources,
    gptActions: seed.gptActions,
    outputChannels: ["Save to Web Dashboard", "Save to Notifications", "Send Telegram"],
    minPriorityScore: seed.minPriorityScore,
    status: "Active",
    isActive: true,
    lastRunAt: null,
    nextRunAt: nextRunFor(seed.scheduleType, seed.time),
    createdAt,
    updatedAt,
  };
}

export function normalizeDefaultTask(task: ScheduledTask, seed: TaskSeed): ScheduledTask {
  return {
    ...task,
    name: seed.name,
    type: seed.type,
    scheduleType: seed.scheduleType,
    cronExpression: seed.cronExpression,
    time: seed.time,
    timezone: task.timezone || "Asia/Bangkok",
    dataSources: seed.dataSources,
    gptActions: seed.gptActions,
    outputChannels: task.outputChannels.includes("Send Telegram")
      ? task.outputChannels
      : [...task.outputChannels, "Send Telegram"],
    minPriorityScore: seed.minPriorityScore,
    status: "Active",
    isActive: true,
    nextRunAt: task.nextRunAt || nextRunFor(seed.scheduleType, seed.time),
    updatedAt: new Date().toISOString(),
  };
}

export function mergeDefaultScheduledTasks(tasks: ScheduledTask[], userId = "user_001") {
  const cleanTasks = tasks.filter((task) => !isLegacyLongReadTask(task));
  const result: ScheduledTask[] = [];

  for (const seed of DEFAULT_TASK_SEEDS) {
    const existing = cleanTasks.find((task) => matchesDefaultTaskSeed(task, seed));
    result.push(existing ? normalizeDefaultTask(existing, seed) : buildDefaultScheduledTask(seed, userId, result.length));
  }

  for (const task of cleanTasks) {
    if (!result.some((item) => item.id === task.id) && !DEFAULT_TASK_SEEDS.some((seed) => matchesDefaultTaskSeed(task, seed))) {
      result.push(task);
    }
  }

  return result;
}
