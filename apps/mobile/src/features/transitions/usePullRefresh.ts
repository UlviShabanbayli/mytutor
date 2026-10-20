import { useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';
import { playCue } from '@/lib/cues';
import { duration, easing, spring } from '@/motion';
import { PULL_THRESHOLD, pullOffset } from './pull';
import { swallowNextClick } from './swallowClick';

/** transitions.refresh: released past the threshold, the list settles on it in 180ms. */
const HOLD = { duration: 180, easing: easing.enter };
/** transitions.refresh B: when done, Vızı flies 40pt up and fades in 260ms. */
const FLY_AWAY = 260;

/**
 * transitions.refresh B: the list follows a downward pull at its top; released past 56pt it
 * holds there while `onRefresh` runs, then Vızı flies off and the list springs back (damping
 * 20, stiffness 220). A light cue marks the threshold. Screen readers hear the start and end.
 */
export function usePullRefresh(onRefresh: () => Promise<unknown>, reduced: boolean) {
  const { t } = useTranslation();
  const scrollY = useSharedValue(0);
  const pull = useSharedValue(0);
  /** The finger's travel when the list reached its top during this drag (-1: not yet). */
  const topAt = useSharedValue(-1);
  const armed = useSharedValue(false);
  const busy = useSharedValue(false);
  const hover = useSharedValue(0);
  const leave = useSharedValue(0);

  const settle = useCallback(() => {
    // Vızı stays gone until the list is back, then the next pull starts fresh.
    const reset = () => {
      'worklet';
      leave.set(0);
      busy.set(false);
    };
    pull.set(
      reduced
        ? withTiming(0, { duration: duration.reduced }, reset)
        : withSpring(0, spring.pullBack, reset),
    );
  }, [busy, leave, pull, reduced]);

  const run = useCallback(async () => {
    AccessibilityInfo.announceForAccessibility(t('common.refreshing'));
    if (!reduced) {
      const half = { duration: duration.hover, easing: easing.breathe };
      hover.set(withRepeat(withTiming(1, half), -1, true));
    }
    try {
      await onRefresh();
    } catch {
      // The screen shows its own error state; the pull only has to let go.
    }
    cancelAnimation(hover);
    hover.set(0);
    AccessibilityInfo.announceForAccessibility(t('common.refreshed'));
    const away = { duration: reduced ? duration.reduced : FLY_AWAY, easing: easing.away };
    leave.set(
      withTiming(1, away, (finished) => {
        if (finished) scheduleOnRN(settle);
      }),
    );
  }, [hover, leave, onRefresh, reduced, settle, t]);

  const pan = Gesture.Pan()
    .activeOffsetY(6)
    .failOffsetX([-24, 24])
    .onStart(() => {
      topAt.set(-1);
    })
    .onUpdate((e) => {
      if (busy.get()) return;
      if (scrollY.get() > 0) return;
      if (topAt.get() < 0) topAt.set(Math.max(0, e.translationY));
      const next = pullOffset(e.translationY - topAt.get());
      pull.set(next);
      const past = next >= PULL_THRESHOLD;
      if (past && !armed.get()) scheduleOnRN(playCue, 'press');
      armed.set(past);
    })
    .onEnd(() => {
      if (busy.get()) return;
      armed.set(false);
      if (pull.get() > 0) scheduleOnRN(swallowNextClick);
      if (pull.get() < PULL_THRESHOLD) {
        pull.set(withSpring(0, spring.pullBack));
        return;
      }
      busy.set(true);
      pull.set(withTiming(PULL_THRESHOLD, HOLD));
      scheduleOnRN(run);
    });
  const gesture = Gesture.Simultaneous(pan, Gesture.Native());

  /** Runs a refresh without a pull, e.g. from the screen reader's "Yenilə" action. */
  const refreshNow = () => {
    if (busy.get()) return;
    busy.set(true);
    pull.set(withTiming(PULL_THRESHOLD, HOLD));
    void run();
  };

  return { scrollY, pull, busy, hover, leave, gesture, refreshNow };
}
