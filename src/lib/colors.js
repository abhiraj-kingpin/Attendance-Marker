// Material 3 tonal palette for subjects: `container` is the light tint used
// for avatar/chip backgrounds, `on` is the accessible dark text/icon color
// for that container, `solid` is the full-saturation hue for progress bars
// and borders. Google Blue/Red/Yellow/Green lead the list, extended with a
// few more Google product accent hues for variety across many subjects.
export const SUBJECT_PALETTE = [
  { name: 'blue', container: '#D3E3FD', on: '#1A56DB', solid: '#4285F4' },
  { name: 'red', container: '#FCE8E6', on: '#B3261E', solid: '#EA4335' },
  { name: 'yellow', container: '#FEEFC3', on: '#A35A00', solid: '#FBBC04' },
  { name: 'green', container: '#E6F4EA', on: '#1E7E34', solid: '#34A853' },
  { name: 'purple', container: '#F3E8FD', on: '#7627BB', solid: '#A142F4' },
  { name: 'teal', container: '#D0F4F7', on: '#006064', solid: '#12B5CB' },
  { name: 'orange', container: '#FEE8D6', on: '#B4530A', solid: '#FA903E' },
  { name: 'pink', container: '#FCE4EC', on: '#AD1457', solid: '#EC407A' },
  { name: 'indigo', container: '#E8EAF6', on: '#303F9F', solid: '#5C6BC0' },
  { name: 'brown', container: '#EFEBE9', on: '#5D4037', solid: '#8D6E63' },
];

export function colorForIndex(index) {
  return SUBJECT_PALETTE[Math.abs(index) % SUBJECT_PALETTE.length];
}

export function colorForSubject(subject) {
  if (!subject) return SUBJECT_PALETTE[0];
  return colorForIndex(subject.colorIndex ?? 0);
}
