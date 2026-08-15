import { inflateSync } from 'zlib';

// PDF text extraction: same approach as mobile/src/lib/extractPdfText.js
// (byte-level object parsing + zlib inflate for FlateDecode streams, no
// DOM dependency) — here using Node's built-in zlib instead of pako,
// since Node has it natively and this only runs server-side. Handles
// typeset (non-scanned) PDFs; a genuinely scanned/handwritten PDF would
// need a real OCR pass per page, which is a separate, much heavier
// pipeline not built here (impractical for an 800-page document anyway).

const STREAM_RE = /(\d+)\s+0\s+obj[\s\S]*?<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;

function bytesToLatin1(bytes: Buffer): string {
  return bytes.toString('latin1');
}

function decodeStream(dict: string, rawBody: string): string | null {
  const bytes = Buffer.from(rawBody, 'latin1');
  if (!/\/FlateDecode/.test(dict)) return bytesToLatin1(bytes);
  try {
    return bytesToLatin1(inflateSync(bytes));
  } catch {
    return null;
  }
}

function unescapePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function extractTextFromContentStream(content: string): string {
  const out: string[] = [];
  const tokenRe = /\((?:[^()\\]|\\.)*\)\s*Tj|\[(?:[^\[\]]|\\.)*\]\s*TJ|\((?:[^()\\]|\\.)*\)\s*'|T\*|Td|TD/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(content))) {
    const tok = match[0];
    if (tok === 'T*' || tok.endsWith('Td') || tok.endsWith('TD')) {
      out.push('\n');
      continue;
    }
    if (tok.endsWith('TJ')) {
      const arrayBody = tok.slice(1, tok.lastIndexOf(']'));
      const partRe = /\((?:[^()\\]|\\.)*\)|-?\d+(?:\.\d+)?/g;
      let m: RegExpExecArray | null;
      while ((m = partRe.exec(arrayBody))) {
        if (m[0].startsWith('(')) out.push(unescapePdfString(m[0].slice(1, -1)));
        else if (parseFloat(m[0]) < -100) out.push(' ');
      }
    } else {
      const strMatch = tok.match(/\((?:[^()\\]|\\.)*\)/);
      if (strMatch) out.push(unescapePdfString(strMatch[0].slice(1, -1)));
      if (tok.endsWith("'")) out.push('\n');
    }
  }
  return out.join('');
}

export interface PdfExtractionResult {
  text: string;
  pageCount: number | null;
  partial: boolean;
}

export function extractTextFromPDF(pdfBuffer: Buffer): PdfExtractionResult {
  const raw = bytesToLatin1(pdfBuffer);
  const pageCount = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;

  let text = '';
  let partial = false;
  let match: RegExpExecArray | null;
  STREAM_RE.lastIndex = 0;
  while ((match = STREAM_RE.exec(raw))) {
    const [, , dict, body] = match;
    if (/\/Font\b/.test(dict) || /\/Image\b/.test(dict)) continue;
    const decoded = decodeStream(dict, body);
    if (decoded == null) {
      partial = true;
      continue;
    }
    const chunk = extractTextFromContentStream(decoded);
    if (chunk.trim()) text += chunk + '\n';
  }

  return { text: text.trim(), pageCount: pageCount || null, partial };
}

const SYLLABUS_KEYWORDS = ['syllabus', 'course content', 'unit', 'chapter', 'module', 'topics'];

/** Finds where syllabus-like content starts in a larger document; returns everything from there on. */
export function detectSyllabusContent(text: string): { syllabusText: string; found: boolean } {
  const lower = text.toLowerCase();
  let earliestIndex = -1;
  for (const keyword of SYLLABUS_KEYWORDS) {
    const idx = lower.indexOf(keyword);
    if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) earliestIndex = idx;
  }
  if (earliestIndex === -1) return { syllabusText: text, found: false };
  return { syllabusText: text.slice(earliestIndex), found: true };
}

const UNIT_HEADER_RE = /^\s*(unit|chapter|module)[\s\-–]*([ivxlcdm]+|\d+)\s*[:.\-–]?\s*(.*)$/i;
const ROMAN_TO_NUMBER: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12 };

function normalizeLabel(keyword: string, raw: string): string {
  const label = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
  if (/^\d+$/.test(raw)) return `${label} ${raw}`;
  const n = ROMAN_TO_NUMBER[raw.toLowerCase()];
  return n ? `${label} ${n}` : `${label} ${raw.toUpperCase()}`;
}

export interface SyllabusBlockDraft {
  title: string;
  content: string;
  order: number;
  estimated_hours: number | null;
  confidence: number;
}

/** Splits syllabus text into Unit/Chapter/Module blocks — same header logic as mobile/src/lib/parseSyllabusText.js. */
export function parseIntoBlocks(syllabusText: string): SyllabusBlockDraft[] {
  const lines = syllabusText.split(/\r?\n/);
  const sections: { name: string; lines: string[] }[] = [];
  let current: { name: string; lines: string[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(UNIT_HEADER_RE);
    if (m) {
      current = { name: normalizeLabel(m[1], m[2]), lines: [] };
      sections.push(current);
      if (m[3]?.trim()) current.lines.push(m[3].trim());
      continue;
    }
    if (!current) {
      current = { name: 'General', lines: [] };
      sections.push(current);
    }
    current.lines.push(line);
  }

  return sections
    .filter((s) => s.lines.length > 0)
    .map((s, i) => ({
      title: s.name,
      content: s.lines.join('\n'),
      order: i + 1,
      estimated_hours: null,
      confidence: s.name === 'General' ? 40 : 85,
    }));
}
