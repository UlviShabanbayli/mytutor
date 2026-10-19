import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { scoreTier } from '@/features/tests/scoring';
import { useThemeColors } from '@/theme';

type ScoreRingProps = {
  correct: number;
  total: number;
  size?: number;
  accessibilityLabel: string;
};

const STROKE = 13;

/** "8/10 düz cavab" inside a ring filled to the share of correct answers. */
export function ScoreRing({ correct, total, size = 148, accessibilityLabel }: ScoreRingProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const share = total ? correct / total : 0;
  const tier = scoreTier(Math.round(share * 100));
  const ringColor =
    tier === 'excellent' ? colors.ok : tier === 'good' ? colors.honey : colors['honey-text'];

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
            stroke={colors.border}
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
            strokeDashoffset={circumference * (1 - share)}
          />
        </Svg>
      </View>
      <View className="absolute items-center">
        <Text className="font-sans-black text-4xl">
          {correct}
          <Text className="font-sans-black text-xl text-muted">{`/${total}`}</Text>
        </Text>
        <Text variant="caption" tone="muted">
          {t('result.ringCaption')}
        </Text>
      </View>
    </View>
  );
}
