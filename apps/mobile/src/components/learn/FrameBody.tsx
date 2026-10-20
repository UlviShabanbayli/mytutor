import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { frameToggle as t } from '@/features/learn/hiveMotion';
import { easing, useReducedMotionPref } from '@/motion';

type FrameBodyProps = {
  open: boolean;
  children: ReactNode;
};

/** Before the first measurement of a frame that was open on arrival: its own height. */
const NATURAL = -1;

/**
 * The part of a frame that opens and closes (hive.frame-toggle A): the height grows from 0
 * to the content's own in 320ms; on close the content fades in 120ms and the height follows
 * in 260ms. The content leaves the tree once the frame is closed.
 */
export function FrameBody({ open, children }: FrameBodyProps) {
  const reduced = useReducedMotionPref();
  const height = useSharedValue(open ? NATURAL : 0);
  const fade = useSharedValue(1);
  const measured = useRef(0);
  const opening = useRef(false);
  const openUntil = useRef(0);
  const handled = useRef(open);
  // While closing, the content stays until the height reaches 0.
  const [was, setWas] = useState(open);
  const [closing, setClosing] = useState(false);
  if (was !== open) {
    setWas(open);
    setClosing(!open && !reduced);
  }

  useEffect(() => {
    // Only toggles animate (not the first render, nor a second effect run for the same value).
    if (handled.current === open) return;
    handled.current = open;
    cancelAnimation(height);
    cancelAnimation(fade);
    fade.set(1);
    if (open) {
      // Reduced motion: the height jumps when the content is measured.
      opening.current = !reduced;
      return;
    }
    opening.current = false;
    if (!closing) {
      height.set(0);
      return;
    }
    height.set(measured.current);
    fade.set(withTiming(0, { duration: t.cellsOut }));
    height.set(withDelay(t.closeDelay, withTiming(0, { duration: t.close, easing: easing.enter })));
    const id = setTimeout(() => setClosing(false), t.closeDelay + t.close);
    return () => clearTimeout(id);
    // Runs when the frame is toggled, not when `closing` ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    measured.current = h;
    if (!open) return;
    if (opening.current) {
      opening.current = false;
      openUntil.current = Date.now() + t.open;
      height.set(0);
      height.set(withTiming(h, { duration: t.open, easing: easing.enter }));
      return;
    }
    // The content changed size while open: follow it (finishing an opening if one runs).
    const left = openUntil.current - Date.now();
    height.set(left > 0 ? withTiming(h, { duration: left, easing: easing.enter }) : h);
  };

  // Keys are only ever added (NATURAL → a number), never removed, so none goes stale.
  const style = useAnimatedStyle(() =>
    height.value === NATURAL
      ? { opacity: fade.value }
      : { height: height.value, overflow: 'hidden', opacity: fade.value },
  );

  if (!open && !closing) return null;
  return (
    <Animated.View style={style}>
      <View onLayout={onLayout}>{children}</View>
    </Animated.View>
  );
}
