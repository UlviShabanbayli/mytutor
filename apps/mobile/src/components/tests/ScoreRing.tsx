import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemeColors } from '@/theme';
import { Text } from '@/components/ui';

type ScoreRingProps = {
  /** 0–100 */
  percent: number;
  size?: number;
  accessibilityLabel: string;
};

const STROKE = 14;

export function ScoreRing({ percent, size = 168, accessibilityLabel }: ScoreRingProps) {
  const colors = useThemeColors();
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = percent >= 85 ? colors.success : percent >= 60 ? colors.primary : colors.accent;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center"
    >
      {/* Rotated so the ring starts at 12 o'clock (SVG `origin` is not valid on web). */}
      <View className="-rotate-90">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.muted}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - percent / 100)}
          />
        </Svg>
      </View>
      <View className="absolute items-center">
        <Text variant="display">{`${percent}%`}</Text>
      </View>
    </View>
  );
}
