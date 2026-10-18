import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { GoalProgress } from '@/features/today/goal';
import { useThemeColors } from '@/theme';

const SIZE = 64;
const RADIUS = 26;
const STROKE = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type GoalRingProps = {
  progress: GoalProgress;
};

/** Minutes done today as a honey ring on wax, the number in the middle. */
export function GoalRing({ progress }: GoalRingProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const percent = Math.round(progress.fraction * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('today.goal.ringLabel', { done: progress.done, goal: progress.goal })}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className="items-center justify-center"
      // The ring is drawn at a fixed design size in SVG units.
      style={{ width: SIZE, height: SIZE }}
    >
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.wax}
          strokeWidth={STROKE}
        />
        {progress.fraction > 0 ? (
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={colors.honey}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * progress.fraction} ${CIRCUMFERENCE}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ) : null}
      </Svg>
      <Text className="font-display-black text-base leading-[16px]">{progress.done}</Text>
      <Text className="font-sans-bold text-[10px] leading-[12px] text-muted">
        {t('today.goal.ringCaption', { goal: progress.goal })}
      </Text>
    </View>
  );
}
