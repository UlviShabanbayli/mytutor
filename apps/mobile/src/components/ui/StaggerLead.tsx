import { type ReactNode, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { rowDelay } from '@/features/transitions/listStagger';
import { useStaggerItem } from '@/features/transitions/staggerContext';
import { spring } from '@/motion';

type StaggerLeadProps = {
  children: ReactNode;
};

/** transitions.list C: the row's hexagon pops from 60% (about 9% overshoot). */
const FROM = 0.6;

/** The leading cell, photo or badge of a staggered row: it pops in first. */
export function StaggerLead({ children }: StaggerLeadProps) {
  const item = useStaggerItem();
  const [animate] = useState(() => item?.animate ?? false);
  const scale = useSharedValue(animate ? FROM : 1);
  const index = item?.index ?? 0;
  useEffect(() => {
    if (animate) scale.set(withDelay(rowDelay(index), withSpring(1, spring.list)));
  }, [animate, index, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
