import { type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { rowDelay } from '@/features/transitions/listStagger';
import { StaggerGroupContext, StaggerItemContext } from '@/features/transitions/staggerContext';
import { useReducedMotionPref } from '@/motion';

type StaggerItemProps = {
  /** Place of the row in the list, counted across its day groups. */
  index: number;
  children: ReactNode;
};

/** transitions.list C: the row's card fades in 160ms on its turn. */
const ROW_FADE = 160;

/**
 * One row of a `StaggerGroup`. The row fades in on its turn while its `StaggerLead` pops and
 * its `StaggerText` slides in. With less motion it is simply there. (Driven by shared values,
 * not layout animations: on the web those leave the row's parts out of the layout flow.)
 */
export function StaggerItem({ index, children }: StaggerItemProps) {
  const group = useContext(StaggerGroupContext);
  const reduced = useReducedMotionPref();
  const [animate] = useState(() => group !== null && !group.settled.get() && !reduced);
  const opacity = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) opacity.set(withDelay(rowDelay(index), withTiming(1, { duration: ROW_FADE })));
  }, [animate, index, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const value = useMemo(() => ({ index, animate }), [index, animate]);

  return (
    <StaggerItemContext.Provider value={value}>
      <Animated.View style={style}>{children}</Animated.View>
    </StaggerItemContext.Provider>
  );
}
