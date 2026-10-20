import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { duration, useReducedMotionPref } from '@/motion';

type SkeletonSwapProps = {
  /** The query behind this block has no data yet. */
  pending: boolean;
  /** Stands in for the content, with the same height so nothing jumps. */
  skeleton: ReactNode;
  /** Classes of the block (e.g. "gap-3" when it holds several cards). */
  className?: string;
  children: ReactNode;
};

/**
 * transitions.skeleton C: one block of a screen that swaps its skeleton for its content on its
 * own, as soon as its own request finishes, with a 220ms cross-fade in place (150ms with less
 * motion). Content that was there from the start just shows.
 */
export function SkeletonSwap({ pending, skeleton, className, children }: SkeletonSwapProps) {
  const reduced = useReducedMotionPref();
  const [sawSkeleton, setSawSkeleton] = useState(pending);
  if (pending && !sawSkeleton) setSawSkeleton(true);
  const fade = reduced ? duration.reduced : duration.base;

  if (pending) {
    return (
      <Animated.View exiting={FadeOut.duration(fade)}>
        <View className={className}>{skeleton}</View>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={sawSkeleton ? FadeIn.duration(fade) : undefined}>
      <View className={className}>{children}</View>
    </Animated.View>
  );
}
