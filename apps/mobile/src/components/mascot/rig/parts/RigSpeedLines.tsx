import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import type { RigValues } from '../rigValues';

type RigSpeedLinesProps = { v: RigValues; size: number; pad: number; color: string };

/** Three speed lines behind Vızı during flights; they flicker sideways while shown. */
export function RigSpeedLines({ v, size, pad, color }: RigSpeedLinesProps) {
  const k = size / 200;
  const side = (200 + 2 * pad) * k;
  const style = useAnimatedStyle(() => ({
    opacity: v.speedOp.value,
    transform: [{ translateX: v.speedX.value * k }],
  }));

  return (
    <Animated.View
      style={[styles.layer, { left: -pad * k, top: -pad * k, width: side, height: side }, style]}
    >
      <Svg width={side} height={side} viewBox={`${-pad} ${-pad} ${200 + 2 * pad} ${200 + 2 * pad}`}>
        <Path
          d="M-8 96 H26 M-14 120 H20 M-4 144 H26"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ layer: { position: 'absolute' } });
