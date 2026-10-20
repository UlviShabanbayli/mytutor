import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type SheetHandleProps = {
  /** 0 at rest, 1 while the student holds the sheet. */
  held: SharedValue<number>;
};

/** Held, the design's 40pt handle widens by the lab's ratio, 28 → 36. */
const WIDEN = 36 / 28;

/** The 40×5 grab handle: it widens and darkens while the sheet is held (transitions.sheet B). */
export function SheetHandle({ held }: SheetHandleProps) {
  const widen = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 + (WIDEN - 1) * held.get() }] }));
  const darken = useAnimatedStyle(() => ({ opacity: held.get() }));

  return (
    <View className="items-center">
      <Animated.View style={widen}>
        <View className="h-[5px] w-10 rounded-full bg-border" />
        <Animated.View style={[StyleSheet.absoluteFill, darken]}>
          <View className="flex-1 rounded-full bg-muted" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
