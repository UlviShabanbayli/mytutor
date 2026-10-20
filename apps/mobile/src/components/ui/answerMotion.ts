import { useEffect, useRef, useState } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { correctB, selectB, wrongC } from '@/components/feedback/timelines';
import { duration, spring } from '@/motion';
import type { AnswerState } from './AnswerOption';

/**
 * The state an option shows. After a wrong pick the right answer turns green 350ms after the
 * cross (feedback.wrong C, "as A"); every other change shows at once. Screen readers get the
 * real state immediately.
 */
export function useShownAnswer(state: AnswerState, reduced: boolean): AnswerState {
  const [prev, setPrev] = useState(state);
  const [held, setHeld] = useState<AnswerState | null>(null);
  if (prev !== state) {
    setPrev(state);
    setHeld(state === 'correct' && prev !== 'selected' && !reduced ? prev : null);
  }
  useEffect(() => {
    if (held === null) return;
    const timer = setTimeout(() => setHeld(null), wrongC.rightAt);
    return () => clearTimeout(timer);
  }, [held]);
  return held ?? state;
}

/**
 * feedback.select B: the chosen option lifts 2pt onto a 5pt honey-deep edge and its letter pops
 * 1 → 1.18 → 1; the previous one settles back in 120ms. feedback.correct B: a right pick breathes
 * 1 → 1.03 → 1. Nothing shakes on a wrong pick. Less motion: the edge only, no lift or pops.
 */
export function useAnswerMotion(shown: AnswerState, reduced: boolean) {
  const selected = shown === 'selected';
  const lift = useSharedValue(selected && !reduced ? selectB.lift : 0);
  const edge = useSharedValue(selected ? 1 : 0);
  const letter = useSharedValue(1);
  const breath = useSharedValue(1);
  const last = useRef(shown);

  useEffect(() => {
    const from = last.current;
    last.current = shown;
    if (from === shown) return;
    const quick = { duration: duration.quick };
    if (shown === 'selected') {
      edge.value = withTiming(1, quick);
      if (reduced) return;
      lift.value = withSpring(selectB.lift, spring.lift);
      letter.value = withSequence(
        withTiming(selectB.letterPeak, { duration: selectB.letterUp }),
        withSpring(1, spring.pop),
      );
      return;
    }
    if (from === 'selected') {
      lift.value = withTiming(0, quick);
      edge.value = withTiming(0, quick);
    }
    if (shown === 'correct' && from === 'selected' && !reduced) {
      const half = { duration: duration.base / 2 };
      breath.value = withSequence(withTiming(correctB.breathe, half), withTiming(1, half));
    }
  }, [shown, reduced, lift, edge, letter, breath]);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { scale: breath.value }],
  }));
  // The edge fills its absolutely placed slot; only its opacity moves.
  const edgeStyle = useAnimatedStyle(() => ({ flex: 1, opacity: edge.value }));
  const letterStyle = useAnimatedStyle(() => ({ transform: [{ scale: letter.value }] }));

  return { faceStyle, edgeStyle, letterStyle };
}
