import { GoogleGenAI, Type } from '@google/genai';
import { env } from '../config/env';
import type { ClassifiedResult, ClassificationType } from './ocrService';

const MODEL = 'gemini-3.7-flash'; // free-tier friendly; swap here if it's ever deprecated

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!env.geminiApiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}

export function isLlmAvailable(): boolean {
  return !!env.geminiApiKey;
}

const CLASSIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['subject', 'teacher', 'break', 'time', 'room'] },
          confidence: { type: Type.NUMBER },
        },
        required: ['text', 'type', 'confidence'],
      },
    },
  },
  required: ['entries'],
};

const CLASSIFICATION_PROMPT = `You are classifying lines of OCR'd text from a photo of a college timetable.
For each non-empty line, classify it as exactly one of:
- "subject" — a course/subject name (e.g. "Data Structures", "OS", "Signals and Systems")
- "teacher" — a person's name, usually with a title (Dr./Prof./Mr./Ms./Er.)
- "break" — a non-academic slot (Library, NCC, Sports, Lunch, Gym, Assembly, Free Period, etc.)
- "time" — a time range (e.g. "10:00-11:00")
- "room" — a room/building code (e.g. "431", "A204", "LT-2")

Give a confidence 0-100 for each. OCR text is often noisy (extra spaces, misread
characters) — use judgment. Return every non-empty line exactly once.`;

/**
 * LLM-based classification, used as an upgrade over the heuristic
 * classifier in ocrService.ts when GEMINI_API_KEY is set. Returns null
 * (not a throw) on any failure — missing key, network error, quota,
 * malformed response — so callers can fall back to the heuristics rather
 * than break the scan flow over an optional enhancement.
 */
export async function classifyTimetableWithLLM(rawText: string): Promise<ClassifiedResult | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `${CLASSIFICATION_PROMPT}\n\nText:\n${rawText}`,
      config: { responseMimeType: 'application/json', responseSchema: CLASSIFICATION_SCHEMA },
    });

    const parsed = JSON.parse(response.text ?? '{}') as {
      entries?: { text: string; type: ClassificationType; confidence: number }[];
    };
    if (!parsed.entries) return null;

    const result: ClassifiedResult = { subjects: [], teachers: [], breaks: [], times: [], rooms: [] };
    for (const entry of parsed.entries) {
      const bucket = `${entry.type}s` as keyof ClassifiedResult;
      if (!result[bucket]) continue; // guard against a malformed type from the model
      result[bucket].push({ text: entry.text, type: entry.type, confidence: entry.confidence });
    }
    return result;
  } catch (e) {
    console.error('Gemini classification failed, falling back to heuristics:', e);
    return null;
  }
}

const PACING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    weights: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: 'One relative-effort weight per block, same order as the input, roughly summing to the block count',
    },
  },
  required: ['weights'],
};

/**
 * Estimates each syllabus block's relative teaching effort from its
 * content, instead of assuming every block takes the class equally long
 * (predictionService.ts's default). E.g. a block covering three dense
 * topics should weigh more than one covering a single short topic. Falls
 * back to null (equal weighting) on any failure, same reasoning as above.
 */
export async function estimateBlockWeights(blocks: { title: string; content: string | null }[]): Promise<number[] | null> {
  const ai = getClient();
  if (!ai || blocks.length === 0) return null;

  try {
    const listing = blocks.map((b, i) => `${i + 1}. ${b.title}: ${b.content ?? '(no content listed)'}`).join('\n');
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Given these syllabus units, estimate the relative number of class weeks each likely takes based on how much material it covers. Return one weight per unit, same order, roughly proportional to teaching effort (they don't need to sum to anything specific).\n\n${listing}`,
      config: { responseMimeType: 'application/json', responseSchema: PACING_SCHEMA },
    });

    const parsed = JSON.parse(response.text ?? '{}') as { weights?: number[] };
    if (!parsed.weights || parsed.weights.length !== blocks.length) return null;
    if (parsed.weights.some((w) => !(w > 0))) return null;
    return parsed.weights;
  } catch (e) {
    console.error('Gemini pacing estimate failed, falling back to equal weighting:', e);
    return null;
  }
}
