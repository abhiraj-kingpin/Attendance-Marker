
export const LIGHT_COLORS = {
  gBlue: '#4285F4',
  gBlueContainer: '#D3E3FD',
  gBlueDark: '#1A56DB',
  gRed: '#EA4335',
  gRedContainer: '#FCE8E6',
  gRedDark: '#B3261E',
  gYellow: '#FBBC04',
  gYellowContainer: '#FEEFC3',
  gYellowDark: '#A35A00',
  gGreen: '#34A853',
  gGreenContainer: '#E6F4EA',
  gGreenDark: '#1E7E34',

  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  surfaceVariant2: '#F1F3F4',
  onSurface: '#1F1F1F',
  onSurfaceSecondary: '#444746',
  onSurfaceTertiary: '#5F6368',
  outline: '#C4C7C5',
  outlineVariant: '#E8EAED',
  overlay: 'rgba(0,0,0,0.4)',
};

export const DARK_COLORS = {
  gBlue: '#8AB4F8',
  gBlueContainer: '#0A3A75',
  gBlueDark: '#D3E3FD',
  gRed: '#F2B8B5',
  gRedContainer: '#601410',
  gRedDark: '#F9DEDC',
  gYellow: '#FDD663',
  gYellowContainer: '#4A3900',
  gYellowDark: '#FEEFC3',
  gGreen: '#81C995',
  gGreenContainer: '#0F5223',
  gGreenDark: '#E6F4EA',

  surface: '#1E1F20',
  surfaceVariant: '#131314',
  surfaceVariant2: '#282A2C',
  onSurface: '#E3E3E3',
  onSurfaceSecondary: '#C4C7C5',
  onSurfaceTertiary: '#9AA0A6',
  outline: '#5F6368',
  outlineVariant: '#3C4043',
  overlay: 'rgba(0,0,0,0.6)',
};

export const BASE_FONT_SIZES = {
  '2xs': 11,
  xs: 12,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 21,
  '3xl': 26,
  '4xl': 32,
};

export const FONT_SCALES = {
  small: { label: 'Small', value: 0.88 },
  default: { label: 'Default', value: 1 },
  large: { label: 'Large', value: 1.18 },
};

export const FONT_FAMILIES = {
  system: { label: 'Default', family: undefined },
  serif: { label: 'Serif', family: 'serif' },
  condensed: { label: 'Condensed', family: 'sans-serif-condensed' },
  casual: { label: 'Casual', family: 'casual' },
};

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export const ACCENT_HUE_PRESETS = [
  { label: 'Blue', hue: 217 },
  { label: 'Red', hue: 4 },
  { label: 'Green', hue: 145 },
  { label: 'Yellow', hue: 41 },
  { label: 'Purple', hue: 271 },
  { label: 'Pink', hue: 327 },
  { label: 'Teal', hue: 171 },
  { label: 'Orange', hue: 29 },
];
export const DEFAULT_ACCENT_HUE = 217;

export function computeAccent(hue, scheme) {
  if (scheme === 'dark') {
    return { c: hslToHex(hue, 70, 75), container: hslToHex(hue, 55, 22), dark: hslToHex(hue, 70, 90) };
  }
  return { c: hslToHex(hue, 74, 55), container: hslToHex(hue, 75, 90), dark: hslToHex(hue, 70, 35) };
}

export function computeBackground(hue, scheme) {
  if (hue === null || hue === undefined) return null;
  if (scheme === 'dark') {
    return {
      surface: hslToHex(hue, 14, 16),
      surfaceVariant: hslToHex(hue, 16, 10),
      surfaceVariant2: hslToHex(hue, 13, 19),
      outline: hslToHex(hue, 10, 40),
      outlineVariant: hslToHex(hue, 12, 25),
    };
  }
  return {
    surface: hslToHex(hue, 35, 99),
    surfaceVariant: hslToHex(hue, 30, 96),
    surfaceVariant2: hslToHex(hue, 26, 93),
    outline: hslToHex(hue, 15, 78),
    outlineVariant: hslToHex(hue, 20, 90),
  };
}

export function resolveColors(scheme, accentHue = DEFAULT_ACCENT_HUE, backgroundHue = null) {
  const base = scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const accent = computeAccent(accentHue, scheme);
  const bg = computeBackground(backgroundHue, scheme);
  return {
    ...base,
    gBlue: accent.c,
    gBlueContainer: accent.container,
    gBlueDark: accent.dark,
    ...(bg ?? {}),
  };
}

export function buildThemeVars({ scheme, fontScale, fontFamilyKey, accentHue, backgroundHue }) {
  const c = resolveColors(scheme, accentHue, backgroundHue);
  const scale = FONT_SCALES[fontScale]?.value ?? 1;
  const family = FONT_FAMILIES[fontFamilyKey]?.family;

  const vars = {
    '--color-g-blue': c.gBlue,
    '--color-g-blue-container': c.gBlueContainer,
    '--color-g-blue-dark': c.gBlueDark,
    '--color-g-red': c.gRed,
    '--color-g-red-container': c.gRedContainer,
    '--color-g-red-dark': c.gRedDark,
    '--color-g-yellow': c.gYellow,
    '--color-g-yellow-container': c.gYellowContainer,
    '--color-g-yellow-dark': c.gYellowDark,
    '--color-g-green': c.gGreen,
    '--color-g-green-container': c.gGreenContainer,
    '--color-g-green-dark': c.gGreenDark,
    '--color-surface': c.surface,
    '--color-surface-variant': c.surfaceVariant,
    '--color-surface-variant-2': c.surfaceVariant2,
    '--color-on-surface': c.onSurface,
    '--color-on-surface-secondary': c.onSurfaceSecondary,
    '--color-on-surface-tertiary': c.onSurfaceTertiary,
    '--color-outline': c.outline,
    '--color-outline-variant': c.outlineVariant,
    '--font-family': family ?? 'sans-serif',
  };
  for (const [key, px] of Object.entries(BASE_FONT_SIZES)) {
    vars[`--fs-${key}`] = `${Math.round(px * scale)}px`;
  }
  return vars;
}
