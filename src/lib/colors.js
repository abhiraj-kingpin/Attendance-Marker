// Each subject is a "planet" in the universe theme. `strong` is the sphere's
// core hue, `glow` is used for outer light/box-shadow, `soft` is a low-alpha
// tint for glass badges, and `text` is a lightened tint readable on dark
// surfaces.
export const SUBJECT_PALETTE = [
  { name: 'nova', strong: '#8B5CF6', glow: 'rgba(139,92,246,0.55)', soft: 'rgba(139,92,246,0.16)', text: '#C4B5FD' },
  { name: 'comet', strong: '#22D3EE', glow: 'rgba(34,211,238,0.55)', soft: 'rgba(34,211,238,0.16)', text: '#67E8F9' },
  { name: 'flare', strong: '#FB7185', glow: 'rgba(251,113,133,0.5)', soft: 'rgba(251,113,133,0.16)', text: '#FDA4AF' },
  { name: 'solar', strong: '#F59E0B', glow: 'rgba(245,158,11,0.5)', soft: 'rgba(245,158,11,0.16)', text: '#FCD34D' },
  { name: 'aurora', strong: '#10B981', glow: 'rgba(16,185,129,0.5)', soft: 'rgba(16,185,129,0.16)', text: '#6EE7B7' },
  { name: 'cosmic', strong: '#3B82F6', glow: 'rgba(59,130,246,0.5)', soft: 'rgba(59,130,246,0.16)', text: '#93C5FD' },
  { name: 'magenta', strong: '#E879F9', glow: 'rgba(232,121,249,0.5)', soft: 'rgba(232,121,249,0.16)', text: '#F0ABFC' },
  { name: 'teal', strong: '#14B8A6', glow: 'rgba(20,184,166,0.5)', soft: 'rgba(20,184,166,0.16)', text: '#5EEAD4' },
  { name: 'crimson', strong: '#F87171', glow: 'rgba(248,113,113,0.5)', soft: 'rgba(248,113,113,0.16)', text: '#FCA5A5' },
  { name: 'indigo', strong: '#6366F1', glow: 'rgba(99,102,241,0.5)', soft: 'rgba(99,102,241,0.16)', text: '#A5B4FC' },
];

export function colorForIndex(index) {
  return SUBJECT_PALETTE[Math.abs(index) % SUBJECT_PALETTE.length];
}

export function colorForSubject(subject) {
  if (!subject) return SUBJECT_PALETTE[0];
  return colorForIndex(subject.colorIndex ?? 0);
}
