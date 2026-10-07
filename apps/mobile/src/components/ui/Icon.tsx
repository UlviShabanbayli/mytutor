import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors, type SemanticColors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: keyof SemanticColors;
  /** Provide only when the icon conveys meaning without adjacent text. */
  accessibilityLabel?: string;
};

export function Icon({ name, size = 24, color = 'foreground', accessibilityLabel }: IconProps) {
  const colors = useThemeColors();
  const decorative = accessibilityLabel === undefined;

  return (
    <Ionicons
      name={name}
      size={size}
      color={colors[color]}
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityElementsHidden={decorative}
    />
  );
}
