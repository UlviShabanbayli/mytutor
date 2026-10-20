import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { textDelay } from '@/features/transitions/listStagger';
import { useStaggerItem } from '@/features/transitions/staggerContext';
import { duration, easing } from '@/motion';

type StaggerTextProps = {
  /** Classes of the text column (it already fills the rest of the row). */
  className?: string;
  children: ReactNode;
};

/** transitions.list C: the text slides in from 8pt to the left after its hexagon. */
const FROM = -8;

/** The text column of a staggered row: it fills the row and slides in after the lead. */
export function StaggerText({ className, children }: StaggerTextProps) {
  const item = useStaggerItem();
  const [animate] = useState(() => item?.animate ?? false);
  const progress = useSharedValue(animate ? 0 : 1);
  const index = item?.index ?? 0;
  useEffect(() => {
    if (!animate) return;
    const config = { duration: duration.base, easing: easing.enter };
    progress.set(withDelay(textDelay(index), withTiming(1, config)));
  }, [animate, index, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateX: FROM * (1 - progress.get()) }],
  }));

  return (
    <Animated.View style={[styles.fill, style]}>
      <View className={className}>{children}</View>
    </Animated.View>
  );
}

// The column takes the rest of the row and may shrink below its text's width (flex-1 min-w-0).
const styles = StyleSheet.create({ fill: { flex: 1, minWidth: 0 } });
