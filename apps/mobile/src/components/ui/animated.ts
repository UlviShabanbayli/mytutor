import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

// Reanimated's components are not NativeWind components, so a `className` on them is dropped
// (checked on Expo web: no classes reach the DOM). Registering them once lets animated
// views keep the design's classes and carry only the animated values in `style`.
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

/** Reanimated components that take `className` (import these instead of `Animated.*`). */
export const AnimatedView = Animated.View;
export const AnimatedText = Animated.Text;
export const AnimatedScrollView = Animated.ScrollView;
