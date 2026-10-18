import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/theme';

type ReadinessRingProps = {
  percent: number;
};

const SIZE = 48;
const STROKE = 5;
const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A small honey ring filled to the readiness percent (decorative: the row reads it out). */
export function ReadinessRing({ percent }: ReadinessRingProps) {
  const colors = useThemeColors();
  const share = Math.min(100, Math.max(0, percent)) / 100;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-12 w-12 items-center justify-center"
    >
      {/* Rotated so the arc starts at 12 o'clock (SVG `origin` is not valid on web). */}
      <View className="absolute -rotate-90">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.wax}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.honey}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * (1 - share)}
          />
        </Svg>
      </View>
      <Text className="font-sans-black text-xs">{`${Math.round(percent)}%`}</Text>
    </View>
  );
}
