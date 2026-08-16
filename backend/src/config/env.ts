import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
  // Optional — OCR classification and syllabus pacing fall back to the
  // existing heuristics/math when this isn't set. Free tier at
  // https://aistudio.google.com/apikey.
  geminiApiKey: process.env.GEMINI_API_KEY ?? null,
};
