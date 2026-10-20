import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDepthStore } from '@/features/transitions/depthStore';
import { useDepthProgress } from '@/features/transitions/useDepthProgress';
import { useReducedMotionPref } from '@/motion';

type DepthScreenProps = {
  /** True while a confirmation dialog stands in front; by default, while a DepthDialog is open. */
  receded?: boolean;
  children: ReactNode;
};

/** transitions.dialog C: the screen behind steps back to 94% with 18pt corners. */
const SCALE = 0.94;
const RADIUS = 18;

/**
 * Wraps a screen that steps back while a `DepthDialog` is open over it, on the dark `spot`
 * ground.
 * With less motion nothing scales: the dialog's scrim alone dims it.
 */
export function DepthScreen({ receded, children }: DepthScreenProps) {
  const reduced = useReducedMotionPref();
  const dialogOpen = useDepthStore((s) => s.receded);
  const { progress } = useDepthProgress((receded ?? dialogOpen) && !reduced);
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      overflow: 'hidden',
      borderRadius: RADIUS * p,
      transform: [{ scale: 1 - (1 - SCALE) * p }],
    };
  });

  return (
    <View className="flex-1 bg-spot">
      <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>
    </View>
  );
}
