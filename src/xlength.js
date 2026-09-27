// Character counting the way X counts it (twitter-text v3 weighting):
// Latin, Hebrew and most common scripts count 1, other scripts (e.g. CJK)
// and emoji count 2, and every link counts 23 regardless of its length.
const LIGHT_RANGES = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
const URL_RE = /https?:\/\/\S+/g;
const URL_WEIGHT = 23;

export const FREE_LIMIT = 280;
export const PREMIUM_LIMIT = 25000;

export const limitFor = (premium) => (premium ? PREMIUM_LIMIT : FREE_LIMIT);

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

export function xLength(text) {
  const urls = text.match(URL_RE) || [];
  let count = urls.length * URL_WEIGHT;
  for (const { segment } of segmenter.segment(text.replace(URL_RE, ""))) {
    if (/\p{Extended_Pictographic}/u.test(segment)) {
      count += 2;
      continue;
    }
    for (const ch of segment) {
      const cp = ch.codePointAt(0);
      count += LIGHT_RANGES.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
    }
  }
  return count;
}

// Threads come back as posts separated by a line with "---".
export function splitPosts(text) {
  return text
    .split(/^\s*---\s*$/m)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function overLimit(text, limit) {
  return splitPosts(text)
    .map((post, i) => ({ index: i + 1, length: xLength(post) }))
    .filter((p) => p.length > limit);
}
