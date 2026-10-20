import { useState } from 'react';
import { View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { cellWidth } from '@/components/feedback/motionMath';
import { Text } from '@/components/ui';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { ProgressHex, type ProgressCell } from './ProgressHex';

type SessionProgressProps = {
  /** 0-based index of the current question. */
  index: number;
  total: number;
  /** The current question's answer has been checked: its cell fills. */
  checked: boolean;
};

const GAP = 3;
const MAX_CELL = 20;

// The count rolls up 6pt as it changes (the lab's progress count, 220ms).
const countIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 6 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: easing.enter },
}).duration(duration.base);

const cellState = (i: number, index: number, checked: boolean): ProgressCell =>
  i < index || (i === index && checked) ? 'done' : i === index ? 'current' : 'next';

/**
 * feedback.progress C: one hex cell per question; answered ones fill with honey, the current one
 * has a honey rim; and the count "4/10".
 */
export function SessionProgress({ index, total, checked }: SessionProgressProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const [width, setWidth] = useState(0);
  const label = t('session.progress', { current: index + 1, total });
  const size = cellWidth(total, width, GAP, MAX_CELL);

  return (
    <View className="flex-1 flex-row items-center gap-2">
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: total, now: index + 1 }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        className="flex-1 flex-row items-center gap-[3px]"
      >
        {width > 0
          ? Array.from({ length: total }, (_, i) => (
              <ProgressHex key={i} state={cellState(i, index, checked)} width={size} />
            ))
          : null}
      </View>
      <View className="min-w-12 items-end pr-2">
        <Animated.View key={index} entering={reduced ? undefined : countIn}>
          <Text
            accessibilityElementsHidden
            importantForAccessibility="no"
            className="font-sans-black text-sm text-muted"
          >
            {`${index + 1}/${total}`}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
