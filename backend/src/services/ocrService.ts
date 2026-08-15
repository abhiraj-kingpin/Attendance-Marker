import { createWorker } from 'tesseract.js';

export const BREAK_ACTIVITIES = [
  'library', 'ncc', 'nss', 'sports', 'games', 'lunch', 'lunch break', 'break',
  'recess', 'gym', 'yoga', 'assembly', 'free period', 'free', 'lab practice',
  'self study', 'club activity', 'counselling', 'mentoring', 'placement',
];

export const PERSON_PREFIXES = ['dr', 'prof', 'mr', 'ms', 'mrs', 'er', 'shri', 'smt'];

const TIME_RE = /\b\d{1,2}[:.]\d{2}\s*[-–]\s*\d{1,2}[:.]\d{2}\b/;
const ROOM_RE = /\b[A-Za-z]?\d{3}\b/;
const TITLE_RE = new RegExp(`^(${PERSON_PREFIXES.join('|')})\\.?\\s+`, 'i');

export type ClassificationType = 'subject' | 'teacher' | 'break' | 'time' | 'room';

export interface Classification {
  text: string;
  type: ClassificationType;
  confidence: number;
}

/** Runs Tesseract OCR against an image buffer, returns the raw recognized text. */
export async function extractTimetableFromImage(imageBuffer: Buffer): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(imageBuffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

function isBreakActivity(line: string): boolean {
  const lower = line.toLowerCase().trim();
  return BREAK_ACTIVITIES.some((a) => lower === a || lower.startsWith(a + ' '));
}

/** Confidence score 0-100 for a single line's classification. */
export function confidenceScore(text: string, type: ClassificationType): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  switch (type) {
    case 'time':
      return TIME_RE.test(trimmed) ? 95 : 20;
    case 'room':
      return ROOM_RE.test(trimmed) && trimmed.split(/\s+/).length <= 2 ? 85 : 30;
    case 'break':
      return isBreakActivity(trimmed) ? 90 : 20;
    case 'teacher':
      return TITLE_RE.test(trimmed) ? 85 : 35;
    case 'subject': {
      const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
      if (/^[A-Z]{2,6}$/.test(trimmed)) return 75; // subject code, e.g. "DBMS"
      if (wordCount >= 2 && wordCount <= 6) return 78;
      if (wordCount === 1 && trimmed.length <= 3) return 40;
      return 55;
    }
    default:
      return 0;
  }
}

/** Classifies a single OCR'd line into the most likely type, with its score. */
function classifyLine(rawLine: string): Classification {
  const text = rawLine.trim();

  if (TIME_RE.test(text)) return { text, type: 'time', confidence: confidenceScore(text, 'time') };
  if (isBreakActivity(text)) return { text, type: 'break', confidence: confidenceScore(text, 'break') };
  if (TITLE_RE.test(text)) return { text, type: 'teacher', confidence: confidenceScore(text, 'teacher') };
  if (ROOM_RE.test(text) && text.split(/\s+/).length <= 2) {
    return { text, type: 'room', confidence: confidenceScore(text, 'room') };
  }
  return { text, type: 'subject', confidence: confidenceScore(text, 'subject') };
}

export interface ClassifiedResult {
  subjects: Classification[];
  teachers: Classification[];
  breaks: Classification[];
  times: Classification[];
  rooms: Classification[];
}

const CONFIDENCE_THRESHOLD = 70;

export interface ConfirmationNeeded {
  text: string;
  type: ClassificationType;
  reason: string;
}

/** Classifies every non-empty line of raw OCR text. */
export function classifyText(text: string): { classified: ClassifiedResult; requiresConfirmation: ConfirmationNeeded[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const classified: ClassifiedResult = { subjects: [], teachers: [], breaks: [], times: [], rooms: [] };
  const requiresConfirmation: ConfirmationNeeded[] = [];

  for (const line of lines) {
    const result = classifyLine(line);
    const bucket = `${result.type}s` as keyof ClassifiedResult;
    classified[bucket].push({ text: result.text, confidence: result.confidence, type: result.type });

    if (result.confidence < CONFIDENCE_THRESHOLD) {
      requiresConfirmation.push({
        text: result.text,
        type: result.type,
        reason: result.type === 'break' ? 'Might not actually be a break activity' : 'Low confidence classification',
      });
    }
  }

  return { classified, requiresConfirmation };
}
