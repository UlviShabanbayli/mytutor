import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';

type SceneInterpolator = NonNullable<BottomTabNavigationOptions['sceneStyleInterpolator']>;

/**
 * transitions.tabs B, a pager: every tab sits one full width from its neighbour. A tab's
 * progress is -1 left of the active one, 0 when active and 1 right of it, so the new tab comes
 * in from its side while the old one leaves to the other, side by side; no fade, no scale.
 */
export function slideScene(width: number): SceneInterpolator {
  return ({ current }) => ({
    sceneStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-width, 0, width],
          }),
        },
      ],
    },
  });
}

/** With less motion the tabs cross-fade instead. */
export const fadeScene: SceneInterpolator = ({ current }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
  },
});
