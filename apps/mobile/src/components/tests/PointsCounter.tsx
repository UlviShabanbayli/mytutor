import { useEffect, type Ref } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { HoneyDrop } from '@/components/feedback/HoneyDrop';
import { RisingFill } from '@/components/feedback/RisingFill';
import { pointsC } from '@/components/feedback/timelines';
import { Icon, Text } from '@/components/ui';
import { easing } from '@/motion';

const ICON = 20;

export type PointsChip = { key: number; amount: number };

type PointsCounterProps = {
  /** The number on screen; it catches up drop by drop. */
  shown: number;
  /** The points earned in this run, which screen readers hear. */
  total: number;
  /** How full the counter's drop is (0–1). */
  level: SharedValue<number>;
  /** "+10" sliding out under the counter after the last drop. */
  chip: PointsChip | null;
  /** The drop, where the flying drops land. */
  iconRef?: Ref<View>;
};

function Chip({ amount }: { amount: number }) {
  const { t } = useTranslation();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      pointsC.chipDelay,
      withSequence(
        withTiming(1, { duration: pointsC.chipIn, easing: easing.enter }),
        withDelay(
          pointsC.chipIn,
          withTiming(2, { duration: pointsC.chipOut, easing: easing.away }),
        ),
      ),
    );
  }, [p]);
  // 0 → 1: fades in and drops 8pt; 1 → 2: keeps sliding to 18pt while it fades out.
  const style = useAnimatedStyle(() => ({
    opacity: p.value <= 1 ? p.value : 2 - p.value,
    transform: [{ translateY: p.value <= 1 ? 8 * p.value : 8 + 10 * (p.value - 1) }],
  }));
  return (
    <View pointerEvents="none" className="absolute right-0 top-full items-end">
      <Animated.View style={style}>
        <View className="h-6 justify-center rounded-full bg-honey px-2">
          <Text className="font-sans-black text-xs text-on-honey">
            {t('study.common.pointsValue', { count: amount })}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * The run's points in the test header (feedback.points C): a warm chip whose drop fills with
 * honey from the bottom as drops arrive, then drains while "+10" slides out under it.
 */
export function PointsCounter({ shown, total, level, chip, iconRef }: PointsCounterProps) {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityLabel={t('study.test.pointsCounter', { count: total })}
      className="h-[30px] flex-row items-center gap-1 rounded-sm bg-raised pl-1.5 pr-2.5"
    >
      <View ref={iconRef} collapsable={false}>
        <RisingFill width={ICON} height={ICON} level={level}>
          <HoneyDrop size={ICON} rim={false} />
        </RisingFill>
        <Icon name="drop" size={ICON} color="honey-text" />
      </View>
      <Text className="min-w-6 text-right font-sans-black text-base text-honey-text">{shown}</Text>
      {chip ? <Chip key={chip.key} amount={chip.amount} /> : null}
    </View>
  );
}
