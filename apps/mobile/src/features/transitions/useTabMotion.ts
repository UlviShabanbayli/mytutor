import { Easing, useWindowDimensions } from 'react-native';
import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';
import { duration, useReducedMotionPref } from '@/motion';
import { fadeScene, slideScene } from './tabScene';

type TransitionSpec = NonNullable<BottomTabNavigationOptions['transitionSpec']>;

/**
 * React Navigation drives the tabs with React Native's Animated, so the curve is its own
 * `Easing.bezier`: the same cubic-bezier(.2,.8,.2,1) as `easing.enter`.
 */
const slideSpec: TransitionSpec = {
  animation: 'timing',
  config: { duration: duration.enter, easing: Easing.bezier(0.2, 0.8, 0.2, 1) },
};
const fadeSpec: TransitionSpec = {
  animation: 'timing',
  config: { duration: duration.reduced, easing: Easing.linear },
};

/**
 * Screen options of a role's tabs: the content slides by the full width between tabs
 * (transitions.tabs B, 280ms), or cross-fades in 150ms with less motion. The tab bar itself
 * stays still; its items animate on their own (buttons.tabbar).
 */
export function useTabMotion(): BottomTabNavigationOptions {
  const reduced = useReducedMotionPref();
  const { width } = useWindowDimensions();
  return {
    headerShown: false,
    sceneStyleInterpolator: reduced ? fadeScene : slideScene(width),
    transitionSpec: reduced ? fadeSpec : slideSpec,
  };
}
