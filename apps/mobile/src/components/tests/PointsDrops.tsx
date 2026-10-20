import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { HoneyDrop } from '@/components/feedback/HoneyDrop';
import { quadPoint, type Point } from '@/components/feedback/motionMath';
import { pointsC } from '@/components/feedback/timelines';
import { easing } from '@/motion';

const SIZE = 12;

type DropProps = { index: number; from: Point; to: Point };

function Drop({ index, from, to }: DropProps) {
  const t = useSharedValue(0);
  // Alternate the bend so the drops stream instead of queueing on one line (as in the lab).
  const bend = (index % 2 ? 14 : -14) - index;
  const control = { x: from.x + bend, y: to.y };

  useEffect(() => {
    t.value = withDelay(
      index * pointsC.stagger,
      withTiming(1, { duration: pointsC.flight, easing: easing.breathe }),
    );
  }, [t, index]);

  const style = useAnimatedStyle(() => {
    const p = quadPoint(from, control, to, t.value);
    return {
      opacity: t.value <= 0 ? 0 : t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
      transform: [
        { translateX: p.x - SIZE / 2 },
        { translateY: p.y - SIZE / 2 },
        { scale: 1 - 0.45 * t.value },
      ],
    };
  });

  return (
    <View className="absolute left-0 top-0">
      <Animated.View style={style}>
        <HoneyDrop size={SIZE} />
      </Animated.View>
    </View>
  );
}

type PointsDropsProps = {
  /** Where the drops leave (the "+10 bal" pill) and land (the counter's drop), in this layer. */
  from: Point;
  to: Point;
  count: number;
};

/**
 * feedback.points C: small honey drops stream from the right answer's points to the counter in
 * the header, 50ms apart, 550ms each. A decorative layer over the whole test screen.
 */
export function PointsDrops({ from, to, count }: PointsDropsProps) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0"
    >
      {Array.from({ length: count }, (_, i) => (
        <Drop key={i} index={i} from={from} to={to} />
      ))}
    </View>
  );
}
