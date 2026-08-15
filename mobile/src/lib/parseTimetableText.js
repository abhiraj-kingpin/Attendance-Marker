import { DAYS } from './dates';
import { classifyEntry } from './classifyTimetableEntry';

const DAY_PATTERNS = [
  { key: 'Mon', re: /\bmon(day)?\b/i },
  { key: 'Tue', re: /\btue(s|sday)?\b/i },
  { key: 'Wed', re: /\bwed(nesday)?\b/i },
  { key: 'Thu', re: /\bthu(rs|rsday)?\b/i },
  { key: 'Fri', re: /\bfri(day)?\b/i },
  { key: 'Sat', re: /\bsat(urday)?\b/i },
  { key: 'Sun', re: /\bsun(day)?\b/i },
];

const NOISE_RE = /^(\d{1,2}[:.]\d{2}\s*[-–]?\s*)?(\d{1,2}[:.]\d{2})?$|^p(eriod)?\.?\s*\d+$|^\d+\.?$/i;

const CONFIDENCE_THRESHOLD = 70;

// Groups raw OCR lines by day, then classifies each into a subject/teacher/
// room/break-activity guess. A "merge-only" line (just a teacher name or
// just a room number, on its own OCR line) attaches to the entry above it
// rather than becoming its own row — timetables usually OCR one cell as
// several consecutive lines.
export function parseTimetableText(lines, known = {}) {
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
      if (remainder) pushEntry(result, currentDay, remainder, known);
      continue;
    }

    if (!currentDay || NOISE_RE.test(line)) continue;
    pushEntry(result, currentDay, line, known);
  }

  return result;
}

function pushEntry(result, day, rawLine, known) {
  const entry = classifyEntry(rawLine, known);
  if (!entry) return;

  if (entry.mergeOnly) {
    const list = result[day];
    const prev = list[list.length - 1];
    if (prev) {
      if (entry.teacher && !prev.teacher) prev.teacher = entry.teacher;
      if (entry.room && !prev.room) prev.room = entry.room;
      return;
    }
    // Nothing to merge into — surface it as its own low-confidence row
    // rather than silently dropping a line the user might recognize.
  }

  result[day].push({
    raw: entry.raw,
    subject: entry.subject ?? (entry.mergeOnly ? entry.raw : ''),
    teacher: entry.teacher,
    room: entry.room,
    isBreakActivity: entry.isBreakActivity,
    confidence: entry.confidence,
    included: !entry.isBreakActivity && entry.confidence >= CONFIDENCE_THRESHOLD,
  });
}

export { CONFIDENCE_THRESHOLD };
