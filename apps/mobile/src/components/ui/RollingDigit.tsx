import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { spring } from '@/motion';
import { Text } from './Text';

const STRIP = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

type RollingDigitProps = {
  digit: number;
  /** Where the strip starts: 0 to roll in, or the digit itself to appear still. */
  initial: number;
  /** Height of one line of the text, measured by RollingNumber. */
  lineHeight: number;
  delay: number;
  reduced: boolean;
  className?: string;
};

/** One column of a rolling number: a 0–9 strip behind a one-line window (micro.count B). */
export function RollingDigit({
  digit,
  initial,
  lineHeight,
  delay,
  reduced,
  className,
}: RollingDigitProps) {
  const y = useSharedValue(-initial * lineHeight);

  useEffect(() => {
    const to = -digit * lineHeight;
    y.value = reduced ? to : withDelay(delay, withSpring(to, spring.digits));
  }, [digit, lineHeight, delay, reduced, y]);

  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    // The window's height is the measured line, so it can only be set at run time.
    <View className="overflow-hidden" style={{ height: lineHeight }}>
      <Animated.View style={strip}>
        {STRIP.map((d) => (
          <Text key={d} className={cn(className, 'text-center')}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}
