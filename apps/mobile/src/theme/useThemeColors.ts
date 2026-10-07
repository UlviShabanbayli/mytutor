import { colors, type SemanticColors } from './tokens';
import { useColorSchemeName } from './useColorSchemeName';

/**
 * Raw semantic colors for the active scheme. Use only where className cannot reach
 * (navigation theme, icon `color`, ActivityIndicator, placeholderTextColor).
 */
export function useThemeColors(): SemanticColors {
  return colors[useColorSchemeName()];
}
