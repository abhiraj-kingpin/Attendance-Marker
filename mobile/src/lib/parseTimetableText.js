import { DAYS } from './dates';

const DAY_PATTERNS = [
  { key: 'Mon', re: /\bmon(day)?\b/i },
  { key: 'Tue', re: /\btue(s|sday)?\b/i },
  { key: 'Wed', re: /\bwed(nesday)?\b/i },
  { key: 'Thu', re: /\bthu(rs|rsday)?\b/i },
  { key: 'Fri', re: /\bfri(day)?\b/i },
  { key: 'Sat', re: /\bsat(urday)?\b/i },
  { key: 'Sun', re: /\bsun(day)?\b/i },
];

const NOISE_RE = /^(\d{1,2}[:.]\d{2}\s*[-–]?\s*)?(\d{1,2}[:.]\d{2})?$|^p(eriod)?\.?\s*\d+$|^\d+\.?$|^lunch$|^break$/i;

export function parseTimetableText(lines) {
  const result = {};
  for (const day of DAYS) result[day] = [];

  let currentDay = null;
  for (const raw of lines) {
    const line = (raw ?? '').trim();
    if (!line) continue;

    const dayMatch = DAY_PATTERNS.find((d) => d.re.test(line));
    if (dayMatch) {
      currentDay = dayMatch.key;
      const remainder = line.replace(dayMatch.re, '').replace(/^[:\-–\s]+/, '').trim();
      if (remainder && !NOISE_RE.test(remainder)) {
        result[currentDay].push(remainder);
      }
      continue;
    }

    if (!currentDay || NOISE_RE.test(line)) continue;
    result[currentDay].push(line);
  }

  return result;
}
