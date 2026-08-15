
const UNIT_HEADER_RE = /^\s*unit[\s\-–]*([ivxlcdm]+|\d+)\s*[:.\-–]?\s*(.*)$/i;
const ROMAN_TO_NUMBER = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12 };

function normalizeUnitLabel(raw) {
  if (/^\d+$/.test(raw)) return `Unit ${raw}`;
  const n = ROMAN_TO_NUMBER[raw.toLowerCase()];
  return n ? `Unit ${n}` : `Unit ${raw.toUpperCase()}`;
}

function splitIntoTopics(lines) {
  const nonTrivial = lines.map((l) => l.trim()).filter((l) => l.length > 2);
  if (nonTrivial.length >= 2) return nonTrivial;

  const paragraph = lines.join(' ').trim();
  if (!paragraph) return [];
  const sentences = paragraph
    .split(/(?<=[.;])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  return sentences.length > 0 ? sentences : [paragraph];
}

export function parseSyllabusText(rawText) {
  const lines = (rawText || '').split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(UNIT_HEADER_RE);
    if (m) {
      current = { name: normalizeUnitLabel(m[1]), lines: [] };
      sections.push(current);
      if (m[2]?.trim()) current.lines.push(m[2].trim());
      continue;
    }
    if (!current) {
      current = { name: 'General', lines: [] };
      sections.push(current);
    }
    current.lines.push(line);
  }

  return sections
    .map((s) => ({ name: s.name, topics: splitIntoTopics(s.lines) }))
    .filter((s) => s.topics.length > 0);
}
