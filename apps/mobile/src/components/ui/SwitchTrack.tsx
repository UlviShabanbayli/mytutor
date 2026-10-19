import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { duration, spring } from '@/motion';
import { knobShape } from './knobShape';

/** Track and knob sizes; the knob travels the track minus its padding. */
const sizes = {
  md: { track: 'h-[30px] w-[50px] p-[3px]', knobClass: 'h-6 w-6', width: 50, pad: 3, knob: 24 },
  mini: { track: 'h-[18px] w-[30px] p-0.5', knobClass: 'h-3.5 w-3.5', width: 30, pad: 2, knob: 14 },
} as const;

export type SwitchSize = keyof typeof sizes;

type SwitchTrackProps = { on: boolean; size?: SwitchSize };

/**
 * The drawn switch (off: wax track and muted knob; on: honey track and white knob), for controls
 * whose whole row is the switch; `Switch` wraps it in its own hit area. The knob travels with
 * `spring.knob`, stretching on the way and squashing at the end (buttons.switch B); the colours
 * cross-fade in 220 ms. Decorative: the pressable around it carries the role and state.
 */
export function SwitchTrack({ on, size = 'md' }: SwitchTrackProps) {
  const s = sizes[size];
  const travel = s.width - 2 * s.pad - s.knob;
  const x = useSharedValue(on ? travel : 0);
  const tint = useSharedValue(on ? 1 : 0);
  const heading = useSharedValue(on);

  useEffect(() => {
    heading.set(on);
    x.set(withSpring(on ? travel : 0, spring.knob));
    tint.set(withTiming(on ? 1 : 0, { duration: duration.base }));
  }, [on, travel, heading, x, tint]);

  const tintStyle = useAnimatedStyle(() => ({ opacity: tint.get() }));
  const knobStyle = useAnimatedStyle(() => {
    const k = knobShape(x.get(), travel, s.knob, heading.get());
    return {
      transform: [{ translateX: k.translateX }, { scaleX: k.scaleX }, { scaleY: k.scaleY }],
    };
  });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('flex-row items-center rounded-full bg-wax', s.track)}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, tintStyle]}>
        <View className="flex-1 rounded-full bg-honey" />
      </Animated.View>
      <Animated.View style={knobStyle}>
        <View className={cn('rounded-full bg-muted', s.knobClass)} />
        <Animated.View style={[StyleSheet.absoluteFill, tintStyle]}>
          <View className="flex-1 rounded-full bg-surf" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}
