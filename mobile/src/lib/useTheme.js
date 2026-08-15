import { useStore } from '../store/useStore';
import { resolveColors, buildThemeVars } from './theme';

export function useColorSchemeSetting() {
  const themeMode = useStore((s) => s.settings.themeMode);
  return themeMode === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const scheme = useColorSchemeSetting();
  const accentHue = useStore((s) => s.settings.accentHue);
  const backgroundHue = useStore((s) => s.settings.backgroundHue);
  return { scheme, colors: resolveColors(scheme, accentHue, backgroundHue) };
}

export function useThemeVars() {
  const scheme = useColorSchemeSetting();
  const fontScale = useStore((s) => s.settings.fontScale) ?? 'default';
  const fontFamilyKey = useStore((s) => s.settings.fontFamily) ?? 'system';
  const accentHue = useStore((s) => s.settings.accentHue);
  const backgroundHue = useStore((s) => s.settings.backgroundHue);
  return buildThemeVars({ scheme, fontScale, fontFamilyKey, accentHue, backgroundHue });
}
