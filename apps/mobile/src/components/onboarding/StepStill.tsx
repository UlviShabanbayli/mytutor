import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useStepMotion } from '@/features/transitions/stepMotion';

type StepStillProps = {
  children: ReactNode;
};

/**
 * Keeps Vızı in place while the step's question slides in around it: it only fades with the
 * step (transitions.onboarding A: "Vızı does not move").
 */
export function StepStill({ children }: StepStillProps) {
  const motion = useStepMotion();
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: motion ? -motion.x.get() : 0 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
