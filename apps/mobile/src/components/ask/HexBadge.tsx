import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { Icon, type IconName } from '@/components/ui';
import { useThemeColors, type ColorName } from '@/theme';

type HexBadgeProps = {
  /** Width in points; the pointy-top hexagon is ×1.14 as tall (design 58×66, 28×32, 26×30). */
  size?: number;
  fill?: ColorName;
  icon?: IconName;
  iconColor?: ColorName;
  iconSize?: number;
  /** Instead of an icon, e.g. a step number. */
  children?: ReactNode;
};

/** A filled hexagon holding an icon or a short label (the design's clip-path hexagon). */
export function HexBadge({
  size = 58,
  fill = 'honey',
  icon,
  iconColor = 'on-honey',
  iconSize,
  children,
}: HexBadgeProps) {
  const colors = useThemeColors();
  const w = size;
  const h = Math.round(size * 1.14);
  const points = `${w / 2},0 ${w},${h * 0.25} ${w},${h * 0.75} ${w / 2},${h} 0,${h * 0.75} 0,${h * 0.25}`;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center"
      // Size is a prop (badges range from 26 to 58pt), so it cannot be a static className.
      style={{ width: w, height: h }}
    >
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Polygon points={points} fill={colors[fill]} />
      </Svg>
      {icon ? (
        <Icon name={icon} size={iconSize ?? Math.round(size * 0.48)} color={iconColor} />
      ) : (
        children
      )}
    </View>
  );
}
