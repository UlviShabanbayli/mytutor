import { useColorScheme } from 'react-native';
import type { ColorSchemeName } from './tokens';

/** System color scheme, defaulting to light when the platform reports none. */
export function useColorSchemeName(): ColorSchemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
