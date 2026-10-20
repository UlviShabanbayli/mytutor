import { View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useStepMotion } from '@/features/transitions/stepMotion';
import { cn } from '@/lib/cn';
import { duration, easing } from '@/motion';

type StepDashProps = {
  /** 0-based position of this dash. */
  index: number;
  /** 1-based step shown now. */
  step: number;
};

/** The current step's dash is longer than the others (design: 32 and 18pt). */
function widthAt(index: number, step: number): number {
  'worklet';
  return index === step - 1 ? 32 : 18;
}

/**
 * One dash of the step progress. When a step comes in, the dash stretches or shrinks from the
 * width it had on the step before, 220ms (transitions.onboarding A).
 */
export function StepDash({ index, step }: StepDashProps) {
  const motion = useStepMotion();
  const from = motion?.from.get() ?? -1;
  const width = useSharedValue(widthAt(index, from >= 0 ? from : step));
  const target = widthAt(index, step);

  useAnimatedReaction(
    () => motion?.entrance.get() ?? 0,
    (now, previous) => {
      if (previous === null || now === previous || !motion) return;
      const before = motion.from.get();
      if (before >= 0) width.set(widthAt(index, before));
      width.set(withTiming(target, { duration: duration.base, easing: easing.enter }));
    },
  );
  const style = useAnimatedStyle(() => ({ width: width.get() }));

  return (
    <Animated.View style={style}>
      <View className={cn('h-2 rounded-full', index < step ? 'bg-honey' : 'bg-wax')} />
    </Animated.View>
  );
}
