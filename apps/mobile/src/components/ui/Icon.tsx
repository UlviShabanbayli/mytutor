import { View } from 'react-native';
import Svg from 'react-native-svg';
import { useThemeColors, type ColorName } from '@/theme';
import { iconShapes, type IconName } from './iconShapes';

export type { IconName };

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorName;
  /** Provide only when the icon conveys meaning without adjacent text. */
  accessibilityLabel?: string;
};

/** Stroke icon from the arı icon set: 24pt grid, 2.2 stroke, round caps, one color. */
export function Icon({ name, size = 24, color = 'ink', accessibilityLabel }: IconProps) {
  const colors = useThemeColors();
  const decorative = accessibilityLabel === undefined;

  // Accessibility props live on a View: on the web, Svg would pass them to the DOM as is.
  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityElementsHidden={decorative}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors[color]}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconShapes[name]}
      </Svg>
    </View>
  );
}
