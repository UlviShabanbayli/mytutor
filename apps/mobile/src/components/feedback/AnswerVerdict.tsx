import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { cn } from '@/lib/cn';
import { DrawnMark } from './DrawnMark';

type AnswerVerdictProps = {
  verdict: 'correct' | 'wrong';
  /** "Düz" / "Səhv": a verdict is never colour alone. */
  label: string;
  /** Animate the entrance: false when the option was already marked when it appeared. */
  animate: boolean;
};

/**
 * "✓ Düz" / "✕ Səhv" at the end of an answer option: slides in 4pt over 220ms while its mark
 * draws (feedback.correct / wrong). No shake, no flash.
 */
export function AnswerVerdict({ verdict, label, animate }: AnswerVerdictProps) {
  const reduced = useReducedMotionPref();
  const still = reduced || !animate;
  const shown = useSharedValue(still ? 1 : 0);

  useEffect(() => {
    if (!still) shown.value = withTiming(1, { duration: duration.base, easing: easing.enter });
  }, [shown, still]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateX: -4 * (1 - shown.value) }],
  }));
  const right = verdict === 'correct';

  return (
    <Animated.View style={style}>
      <View className="flex-row items-center gap-1">
        <DrawnMark kind={right ? 'check' : 'x'} color={right ? 'ok' : 'err'} reduced={still} />
        <Text className={cn('font-sans-black text-xs', right ? 'text-ok' : 'text-err')}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}
