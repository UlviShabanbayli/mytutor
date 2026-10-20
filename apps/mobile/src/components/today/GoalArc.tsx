import { View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { HoneyDrop } from '@/components/feedback/HoneyDrop';
import { arcHead } from '@/components/feedback/motionMath';
import { useThemeColors } from '@/theme';
import type { GoalRingMotion } from './useGoalRingMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type GoalArcProps = {
  size: number;
  radius: number;
  stroke: number;
  /** An ink arc on a light track (the honey goal-done screen) instead of honey on wax. */
  honeyTone: boolean;
  motion: GoalRingMotion;
};

/**
 * The goal ring's track and arc, and the honey drop riding the arc's head until it falls into
 * the centre (feedback.goal C). Decorative: GoalRing carries the progress for screen readers.
 */
export function GoalArc({ size, radius, stroke, honeyTone, motion }: GoalArcProps) {
  const c = useThemeColors();
  const circumference = 2 * Math.PI * radius;
  const drop = size * 0.2;

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - motion.arc.value),
    // A round cap would leave a dot at zero.
    strokeOpacity: motion.arc.value > 0 ? 1 : 0,
  }));
  const dropStyle = useAnimatedStyle(() => {
    const centre = { x: size / 2, y: size / 2 };
    const head = arcHead(motion.arc.value, centre, radius);
    const f = motion.fall.value;
    return {
      opacity: motion.drop.value * (1 - f),
      transform: [
        { translateX: head.x + (centre.x - head.x) * f - drop / 2 },
        { translateY: head.y + (centre.y - head.y) * f - drop / 2 },
        { scale: 1 - 0.5 * f },
      ],
    };
  });

  return (
    <>
      <View className="absolute inset-0">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={honeyTone ? c.cap : c.wax}
            strokeWidth={stroke}
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={honeyTone ? c['on-honey'] : c.honey}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animatedProps={arcProps}
          />
        </Svg>
      </View>
      <View pointerEvents="none" className="absolute left-0 top-0">
        <Animated.View style={dropStyle}>
          <HoneyDrop size={drop} />
        </Animated.View>
      </View>
    </>
  );
}
