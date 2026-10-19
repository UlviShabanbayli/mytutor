import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { playCue } from '@/lib/cues';
import { duration, spring } from '@/motion';
import { CLOSED_GAP, rubberBand, shouldDismiss } from './sheetDrag';

type SheetMotionArgs = {
  visible: boolean;
  onClose: () => void;
  reduced: boolean;
};

/**
 * transitions.sheet B: the sheet springs open (about 7% overshoot), follows the finger, and
 * closes with a firmer spring that carries the release velocity (past 35% of its height or
 * faster than 800 pt/s). With less motion it fades in and out in 150ms; dragging still works.
 * The sheet stays mounted until its closing animation ends.
 */
export function useSheetMotion({ visible, onClose, reduced }: SheetMotionArgs) {
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const y = useSharedValue(windowHeight);
  const height = useSharedValue(0);
  const fade = useSharedValue(reduced ? 0 : 1);
  const held = useSharedValue(0);
  const start = useSharedValue(0);
  const opened = useSharedValue(false);
  const closing = useSharedValue(false);

  const unmount = useCallback(() => {
    opened.set(false);
    setMounted(false);
  }, [opened]);

  const open = useCallback(() => {
    closing.set(false);
    opened.set(true);
    playCue('open');
    if (reduced) {
      y.set(0);
      fade.set(withTiming(1, { duration: duration.reduced }));
      return;
    }
    fade.set(1);
    // From just below its own height (or from where a close was interrupted), not from the
    // bottom of the window, so the spring's overshoot stays inside the overscan.
    y.set(Math.min(y.get(), height.get() + CLOSED_GAP));
    y.set(withSpring(0, spring.sheetOpen));
  }, [closing, fade, height, opened, reduced, y]);

  const close = useCallback(
    (velocity: number) => {
      'worklet';
      if (closing.get()) return;
      closing.set(true);
      opened.set(false);
      const done = (finished?: boolean) => {
        'worklet';
        if (finished) scheduleOnRN(unmount);
      };
      if (reduced) {
        fade.set(withTiming(0, { duration: duration.reduced }, done));
        return;
      }
      y.set(withSpring(height.get() + CLOSED_GAP, { ...spring.sheetClose, velocity }, done));
    },
    [closing, fade, height, opened, reduced, unmount, y],
  );

  useEffect(() => {
    if (!visible) {
      if (mounted) close(0);
    } else if (height.get() > 0 && !opened.get()) {
      // Opened again while it was still closing: the layout is known, so open at once.
      open();
    }
  }, [visible, mounted, close, open, height, opened]);

  /** The first layout of a newly shown sheet tells how far it has to travel. */
  const onSheetLayout = (sheetHeight: number) => {
    height.set(sheetHeight);
    if (visible && !opened.get()) open();
  };

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetX([-20, 20])
    .onStart(() => {
      cancelAnimation(y);
      start.set(y.get());
      held.set(withTiming(1, { duration: duration.quick }));
    })
    .onUpdate((e) => {
      y.set(rubberBand(start.get() + e.translationY));
    })
    .onEnd((e) => {
      if (closing.get()) return;
      if (shouldDismiss(y.get(), height.get(), e.velocityY)) {
        close(e.velocityY);
        scheduleOnRN(onClose);
      } else {
        y.set(withSpring(0, { ...spring.sheetOpen, velocity: e.velocityY }));
      }
    })
    .onFinalize(() => {
      held.set(withTiming(0, { duration: duration.quick }));
    });

  return { mounted, y, height, fade, held, pan, onSheetLayout };
}
