import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { circleLength, polylineLength } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors } from '@/theme';
import { AnimatedView } from './animated';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** micro.done A on a 72pt mark: ring r 31, then the check (M23 37.5 l9 9 L50 27). */
const RING = circleLength(31);
const CHECK = polylineLength([
  [23, 37.5],
  [32, 46.5],
  [50, 27],
]);
/** The check starts at 380ms, the text rises at 450ms (micro.done A). */
const CHECK_AT = 380;
const TEXT_AT = 450;

type SuccessCheckProps = {
  title?: string;
  body?: string;
  /** `stack`: a 72pt mark over centred text; `row`: a 40pt mark beside the text. */
  layout?: 'stack' | 'row';
  className?: string;
};

/**
 * "Göndərildi" / "Yadda saxlandı": a green ring draws itself, then the check, then the text
 * rises (micro.done A · Xətt). A success tick plays when the check is done.
 */
export function SuccessCheck({ title, body, layout = 'stack', className }: SuccessCheckProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const ring = useSharedValue(reduced ? 0 : RING);
  const check = useSharedValue(reduced ? 0 : CHECK);
  const text = useSharedValue(reduced ? 1 : 0);
  const size = layout === 'stack' ? 72 : 40;

  useEffect(() => {
    const timer = setTimeout(() => playCue('complete'), reduced ? 0 : CHECK_AT + duration.base);
    if (!reduced) {
      ring.value = withTiming(0, { duration: duration.fill, easing: easing.draw });
      check.value = withDelay(
        CHECK_AT,
        withTiming(0, { duration: duration.base, easing: easing.enter }),
      );
      text.value = withDelay(
        TEXT_AT,
        withTiming(1, { duration: duration.base, easing: easing.enter }),
      );
    }
    return () => clearTimeout(timer);
  }, [reduced, ring, check, text]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: ring.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: check.value }));
  const rise = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: (1 - text.value) * 8 }],
  }));

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={[title, body].filter(Boolean).join('. ')}
      className={cn(
        layout === 'stack' ? 'items-center gap-3.5' : 'flex-row items-center gap-3',
        className,
      )}
    >
      <View className="items-center justify-center rounded-full bg-ok-bg">
        <Svg width={size} height={size} viewBox="0 0 72 72">
          <AnimatedCircle
            cx={36}
            cy={36}
            r={31}
            fill="none"
            stroke={colors.ok}
            strokeWidth={4}
            strokeDasharray={RING}
            animatedProps={ringProps}
            // The ring starts at 12 o'clock, as in the lab.
            transform="rotate(-90 36 36)"
          />
          <AnimatedPath
            d="M23 37.5l9 9L50 27"
            fill="none"
            stroke={colors.ok}
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK}
            animatedProps={checkProps}
          />
        </Svg>
      </View>
      {title || body ? (
        <AnimatedView
          style={rise}
          className={cn('gap-1', layout === 'stack' ? 'items-center' : 'min-w-0 flex-1')}
        >
          {title ? (
            <Text
              className={cn(
                'font-display-black',
                layout === 'stack' ? 'text-center text-lg' : 'text-base',
              )}
            >
              {title}
            </Text>
          ) : null}
          {body ? (
            <Text
              tone={title ? 'muted' : 'default'}
              className={cn('text-sm', layout === 'stack' && 'text-center')}
            >
              {body}
            </Text>
          ) : null}
        </AnimatedView>
      ) : null}
    </View>
  );
}
