const monthAliases: Array<[RegExp, string]> = [
  [/(?:มกราคม|ม\.ค\.|january|jan\.?)/giu, " month-01 "],
  [/(?:กุมภาพันธ์|ก\.พ\.|february|feb\.?)/giu, " month-02 "],
  [/(?:มีนาคม|มี\.ค\.|march|mar\.?)/giu, " month-03 "],
  [/(?:เมษายน|เม\.ย\.|april|apr\.?)/giu, " month-04 "],
  [/(?:พฤษภาคม|พ\.ค\.|may)/giu, " month-05 "],
  [/(?:มิถุนายน|มิ\.ย\.|june|jun\.?)/giu, " month-06 "],
  [/(?:กรกฎาคม|ก\.ค\.|july|jul\.?)/giu, " month-07 "],
  [/(?:สิงหาคม|ส\.ค\.|august|aug\.?)/giu, " month-08 "],
  [/(?:กันยายน|ก\.ย\.|september|sept?\.?)/giu, " month-09 "],
  [/(?:ตุลาคม|ต\.ค\.|october|oct\.?)/giu, " month-10 "],
  [/(?:พฤศจิกายน|พ\.ย\.|november|nov\.?)/giu, " month-11 "],
  [/(?:ธันวาคม|ธ\.ค\.|december|dec\.?)/giu, " month-12 "],
];

export function normalizeSearchQuery(value: string) {
  let normalized = value.normalize("NFKC").toLocaleLowerCase("th-TH").replace(/\$([a-z]{1,8})\b/giu, "$1");
  for (const [pattern, replacement] of monthAliases) normalized = normalized.replace(pattern, replacement);
  return normalized
    .replace(/[^\p{L}\p{M}\p{N}._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchQuery(value: string) {
  return normalizeSearchQuery(value).split(" ").filter(Boolean);
}
