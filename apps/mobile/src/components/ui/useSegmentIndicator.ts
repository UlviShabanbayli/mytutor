import { useCallback, useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring } from '@/motion';

type Box = { x: number; width: number };

/**
 * buttons.segment A: one indicator behind the chosen segment that slides to the next choice
 * with `spring.indicator`, its place and width measured from each segment's `onLayout`. The
 * first placement is instant; render `indicatorStyle` on an absolute layer behind the
 * segments (it stays hidden until the chosen segment is measured).
 */
export function useSegmentIndicator(selected: number) {
  const boxes = useRef<Box[]>([]);
  const placed = useRef(false);
  const left = useSharedValue(0);
  const width = useSharedValue(0);
  const shown = useSharedValue(0);

  const moveTo = useCallback(
    (index: number) => {
      const box = boxes.current[index];
      if (!box) return;
      if (!placed.current) {
        placed.current = true;
        left.set(box.x);
        width.set(box.width);
        shown.set(1);
        return;
      }
      left.set(withSpring(box.x, spring.indicator));
      width.set(withSpring(box.width, spring.indicator));
    },
    [left, width, shown],
  );

  useEffect(() => moveTo(selected), [selected, moveTo]);

  const onSegmentLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width: w } = e.nativeEvent.layout;
    boxes.current[index] = { x, width: w };
    // Labels may change width with the choice (e.g. "20 dəq"), so follow the chosen one.
    if (index === selected) moveTo(index);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: shown.get(),
    width: width.get(),
    transform: [{ translateX: left.get() }],
  }));

  return { indicatorStyle, onSegmentLayout };
}
