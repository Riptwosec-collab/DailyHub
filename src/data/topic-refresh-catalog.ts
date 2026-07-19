import { concertSeeds, eventSeeds, formatSeedDateRange } from "@/data/schedule-seeds";

export type TopicRefreshItem = {
  id: string;
  group: string;
  title: string;
  dateTh: string;
  dateEn: string;
  startDate?: string;
  endDate?: string;
  detailTh: string;
  detailEn: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type TopicRefreshCatalog = {
  topic: "concerts" | "movies" | "events";
  labelTh: string;
  labelEn: string;
  noteTh: string;
  noteEn: string;
  items: TopicRefreshItem[];
};

const majorMovieSource = "https://www.majorcineplex.com/movie";
const netflixSource = "https://www.netflix.com/tudum";

const concertTopicItems: TopicRefreshItem[] = concertSeeds.map((item) => ({
  id: item.id,
  group: /เทศกาล|festival/i.test(item.category) ? "outdoor" : "indoor",
  title: item.title,
  dateTh: formatSeedDateRange(item.startDate, item.endDate, "th"),
  dateEn: formatSeedDateRange(item.startDate, item.endDate, "en"),
  startDate: item.startDate,
  endDate: item.endDate,
  detailTh: `${item.venue} · ${item.province}`,
  detailEn: `${item.venue} · ${item.province}`,
  sourceLabel: item.sourceName,
  sourceUrl: item.sourceUrl,
}));

const eventTopicItems: TopicRefreshItem[] = eventSeeds.map((item) => ({
  id: item.id,
  group: /fair|แฟร์|มหกรรม/i.test(`${item.title} ${item.categories.join(" ")}`) ? "fair" : "expo",
  title: item.title,
  dateTh: formatSeedDateRange(item.startDate, item.endDate, "th"),
  dateEn: formatSeedDateRange(item.startDate, item.endDate, "en"),
  startDate: item.startDate,
  endDate: item.endDate,
  detailTh: `${item.venue} · ${item.shortDescription}`,
  detailEn: `${item.venue} · ${item.titleEnglish || item.shortDescription}`,
  sourceLabel: item.sourceName,
  sourceUrl: item.sourceUrl,
}));

export const topicRefreshCatalog: Record<TopicRefreshCatalog["topic"], TopicRefreshCatalog> = {
  movies: {
    topic: "movies",
    labelTh: "หนังโรงไทย + Netflix / ซีรีส์",
    labelEn: "Thai cinema + Netflix / Series",
    noteTh: "ข้อมูลรอบฉายและสตรีมมิงอาจเปลี่ยนตามประกาศของ Major / Netflix ควรตรวจใกล้วันรับชมอีกครั้ง",
    noteEn: "Release and streaming dates may move. Verify with Major / Netflix near the watch date.",
    items: [
      { id: "minion-monster", group: "cinema", title: "มินเนี่ยน & มอนสเตอร์", dateTh: "1 ก.ค. 2026", dateEn: "Jul 1, 2026", detailTh: "แอนิเมชัน / ตลก / ผจญภัย", detailEn: "Animation / Comedy / Adventure", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "krua-sao", group: "cinema", title: "ครัวสาว", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "ดราม่า / ระทึกขวัญ", detailEn: "Drama / Thriller", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "family-unboxed", group: "cinema", title: "ครอบครัวแกะกล่อง", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "ดราม่า / ไซไฟ", detailEn: "Drama / Sci-fi", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "sos-wrong-step", group: "cinema", title: "SOS ก้าวผิดชีวิตเปลี่ยน", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "อาชญากรรม / ระทึกขวัญ", detailEn: "Crime / Thriller", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "moana-live-action", group: "cinema", title: "โมอาน่า ฉบับคนแสดง", dateTh: "9 ก.ค. 2026", dateEn: "Jul 9, 2026", detailTh: "ผจญภัย / แฟนตาซี / เพลง", detailEn: "Adventure / Fantasy / Musical", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "secret-room-final", group: "cinema", title: "นรกห้องลับ วาระสุดท้าย", dateTh: "9 ก.ค. 2026", dateEn: "Jul 9, 2026", detailTh: "สยองขวัญ", detailEn: "Horror", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "dhamaal-4", group: "cinema", title: "Dhamaal 4", dateTh: "10 ก.ค. 2026", dateEn: "Jul 10, 2026", detailTh: "ตลก", detailEn: "Comedy", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "the-odyssey", group: "cinema", title: "มหากาพย์โอดิสซี", dateTh: "16 ก.ค. 2026", dateEn: "Jul 16, 2026", detailTh: "แอ็กชัน / ผจญภัย / แฟนตาซี", detailEn: "Action / Adventure / Fantasy", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "kong-koi", group: "cinema", title: "กองกอย", dateTh: "16 ก.ค. 2026", dateEn: "Jul 16, 2026", detailTh: "สยองขวัญ", detailEn: "Horror", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "dangerous-to-my-heart-movie", group: "cinema", title: "เธอผู้อันตรายต่อใจผม เดอะ มูฟวี่", dateTh: "16 ก.ค. 2026", dateEn: "Jul 16, 2026", detailTh: "โรแมนติก / ผจญภัย", detailEn: "Romance / Adventure", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "pinocchio-horror", group: "cinema", title: "พินอคคิโอ หุ่นไม้สายเชือด", dateTh: "23 ก.ค. 2026", dateEn: "Jul 23, 2026", detailTh: "แฟนตาซี / สยองขวัญ", detailEn: "Fantasy / Horror", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "city-hunt", group: "cinema", title: "ปิดเกมฆ่า ล่าถล่มเมือง", dateTh: "23 ก.ค. 2026", dateEn: "Jul 23, 2026", detailTh: "แอ็กชัน / อาชญากรรม", detailEn: "Action / Crime", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "cursed-bride", group: "cinema", title: "เจ้าสาวสาปสยอง", dateTh: "23 ก.ค. 2026", dateEn: "Jul 23, 2026", detailTh: "สยองขวัญ", detailEn: "Horror", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "secret-friend", group: "cinema", title: "เพื่อนรัก เพื่อนลับ", dateTh: "23 ก.ค. 2026", dateEn: "Jul 23, 2026", detailTh: "ระทึกขวัญ", detailEn: "Thriller", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "last-song-before-fade", group: "cinema", title: "บทเพลงสุดท้าย...ก่อนเธอเลือนหาย", dateTh: "23 ก.ค. 2026", dateEn: "Jul 23, 2026", detailTh: "โรแมนติก / เพลง", detailEn: "Romance / Music", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "spider-man-brand-new-day", group: "cinema", title: "สไปเดอร์-แมน: แบรนด์ นิว เดย์", dateTh: "29 ก.ค. 2026", dateEn: "Jul 29, 2026", detailTh: "แอ็กชัน / ซูเปอร์ฮีโร่", detailEn: "Action / Superhero", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "khai-or-2", group: "cinema", title: "คายอ้อ 2", dateTh: "29 ก.ค. 2026", dateEn: "Jul 29, 2026", detailTh: "หนังไทย", detailEn: "Thai film", sourceLabel: "Major Cineplex", sourceUrl: majorMovieSource },
      { id: "bad-neighbours", group: "streaming", title: "เพื่อนบ้านยอดแย่", dateTh: "1 ก.ค. 2026", dateEn: "Jul 1, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "summer-1936", group: "streaming", title: "ฤดูร้อนปี 1936", dateTh: "1 ก.ค. 2026", dateEn: "Jul 1, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "enola-holmes-3", group: "streaming", title: "เอโนลา โฮล์มส์ 3", dateTh: "1 ก.ค. 2026", dateEn: "Jul 1, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "gas-man", group: "streaming", title: "มนุษย์ก๊าซ", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "survival-of-thickest", group: "streaming", title: "หนาสุด...ย่อมรอด", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "teach-love-virgin", group: "streaming", title: "สอนรักนายเวอร์จิ้น", dateTh: "2 ก.ค. 2026", dateEn: "Jul 2, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "never-too-late-single", group: "streaming", title: "ไม่สายที่จะหายโสด", dateTh: "7 ก.ค. 2026", dateEn: "Jul 7, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "jeff-arcuri-nice-to-meet-you", group: "streaming", title: "Jeff Arcuri: Nice to Meet You", dateTh: "7 ก.ค. 2026", dateEn: "Jul 7, 2026", detailTh: "Stand-up / Netflix", detailEn: "Stand-up / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "not-afraid", group: "streaming", title: "ผมไม่กลัว", dateTh: "8 ก.ค. 2026", dateEn: "Jul 8, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "salcedo-nightlife", group: "streaming", title: "ซัลเซโด จังหวะชีวิตคนกลางคืน", dateTh: "8 ก.ค. 2026", dateEn: "Jul 8, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "nothing-to-lose", group: "streaming", title: "เมื่อไม่มีอะไรจะเสีย", dateTh: "8 ก.ค. 2026", dateEn: "Jul 8, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "little-house-prairie", group: "streaming", title: "บ้านเล็กในทุ่งกว้าง", dateTh: "9 ก.ค. 2026", dateEn: "Jul 9, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "shipwreck-nightmare", group: "streaming", title: "เรืออับปาง: ฝันร้ายกลางทะเล", dateTh: "10 ก.ค. 2026", dateEn: "Jul 10, 2026", detailTh: "สารคดี / Netflix", detailEn: "Documentary / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "miguel-angel-blanco", group: "streaming", title: "คดีลักพาตัวมิเกล อังเฮล บลังโก", dateTh: "10 ก.ค. 2026", dateEn: "Jul 10, 2026", detailTh: "สารคดีอาชญากรรม / Netflix", detailEn: "True crime / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "ace-attorney", group: "streaming", title: "ไพ่ตาย ทนายเหนือคน", dateTh: "10 ก.ค. 2026", dateEn: "Jul 10, 2026", detailTh: "ซีรีส์ / Netflix", detailEn: "Series / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "fake-chairman", group: "streaming", title: "ท่านประธานกำมะลอ", dateTh: "11 ก.ค. 2026", dateEn: "Jul 11, 2026", detailTh: "Netflix เข้าใหม่", detailEn: "New on Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "hot-ones-extra-hot", group: "streaming", title: "Hot Ones: ร้อนฉ่าเป็นพิเศษ", dateTh: "13 ก.ค. 2026", dateEn: "Jul 13, 2026", detailTh: "รายการ / Netflix", detailEn: "Show / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "quarterback", group: "streaming", title: "ควอเตอร์แบ็ก", dateTh: "14 ก.ค. 2026", dateEn: "Jul 14, 2026", detailTh: "กีฬา / สารคดี / Netflix", detailEn: "Sports / Documentary / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
      { id: "ultimatum-marry-or-move-on", group: "streaming", title: "The Ultimatum: เลิกหรือแต่ง", dateTh: "15 ก.ค. 2026", dateEn: "Jul 15, 2026", detailTh: "เรียลลิตี้ / Netflix", detailEn: "Reality / Netflix", sourceLabel: "Netflix Tudum", sourceUrl: netflixSource },
    ],
  },
  concerts: {
    topic: "concerts",
    labelTh: "ตารางคอนเสิร์ต",
    labelEn: "Concert schedule",
    noteTh: "ดึงสถานะแหล่งข้อมูลคอนเสิร์ตพร้อมรายการเด่นที่ใช้ในหน้าตารางคอนเสิร์ต",
    noteEn: "Checks live concert sources and returns highlighted schedule items.",
    items: concertTopicItems,
  },
  events: {
    topic: "events",
    labelTh: "งานอีเวนต์ / Expo / Fair",
    labelEn: "Events / Expo / Fair",
    noteTh: "ดึงสถานะแหล่งข้อมูลอีเวนต์ พร้อมรายการเด่นที่ไม่ซ้ำกับคอนเสิร์ต",
    noteEn: "Checks live event sources and returns curated non-duplicate event items.",
    items: eventTopicItems,
  },
};

export function summarizeTopicCatalog(topic: TopicRefreshCatalog["topic"], items = topicRefreshCatalog[topic].items) {
  const groups = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.group] = (acc[item.group] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalItems: items.length,
    groups,
    latestTitles: items.slice(0, 5).map((item) => item.title),
  };
}
