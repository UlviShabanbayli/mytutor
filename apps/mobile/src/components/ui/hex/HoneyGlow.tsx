import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { easing } from '@/motion';
import { useThemeColors } from '@/theme';

type HoneyGlowProps = {
  /** The cell's box; the glow reaches 22% beyond it on every side. */
  w: number;
  h: number;
  at: number;
  duration: number;
  /** How many times it glows (the queen cell glows twice). */
  times?: number;
};

const SPREAD = 0.22;

/** A soft honey glow around a cell: in to 75% quickly, then out while it widens. */
export function HoneyGlow({ w, h, at, duration, times = 1 }: HoneyGlowProps) {
  const c = useThemeColors();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  useEffect(() => {
    const up = duration * 0.35;
    opacity.value = withDelay(
      at,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: up, easing: easing.glow }),
          withTiming(0, { duration: duration - up, easing: easing.glow }),
        ),
        times,
      ),
    );
    scale.value = withDelay(
      at,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 0 }),
          withTiming(1.2, { duration, easing: easing.glow }),
        ),
        times,
      ),
    );
  }, [opacity, scale, at, duration, times]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const gw = w * (1 + SPREAD * 2);
  const gh = h * (1 + SPREAD * 2);
  const id = `glow${w}x${h}`;

  return (
    <View
      pointerEvents="none"
      className="absolute"
      // Placed by the cell's size: 22% outside the cell on every side.
      style={{ left: -w * SPREAD, top: -h * SPREAD }}
    >
      <Animated.View style={style}>
        <Svg width={gw} height={gh}>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={c.honey} stopOpacity={1} />
              <Stop offset="1" stopColor={c.honey} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={gw / 2} cy={gh / 2} rx={gw / 2} ry={gh / 2} fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  );
}
