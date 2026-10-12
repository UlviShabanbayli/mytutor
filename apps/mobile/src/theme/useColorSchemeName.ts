import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/features/settings/themeStore';
import type { ColorSchemeName } from './tokens';

/** The student's chosen scheme, or the system one (light when the platform reports none). */
export function useColorSchemeName(): ColorSchemeName {
  const system = useColorScheme() === 'dark' ? 'dark' : 'light';
  const preference = useThemeStore((s) => s.preference);
  return preference === 'system' ? system : preference;
}
