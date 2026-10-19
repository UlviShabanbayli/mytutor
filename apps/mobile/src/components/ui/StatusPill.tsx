import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { cn } from '@/lib/cn';
import { playCue } from '@/lib/cues';
import { CHECK_LENGTH, CHECK_PATH } from '@/lib/strokes';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { useThemeColors, type ColorName } from '@/theme';
import { AnimatedView } from './animated';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * - `ai`: AI wrote it and no teacher has checked it yet (always visible on AI text).
 * - `teacher`: a teacher approved it.
 * - `premium`: needs a premium plan; a calm lock, never a wall over core learning.
 * - `points`: points earned, e.g. "+15 bal".
 * - `soon`: content not ready yet ("Hazırlanır").
 */
export type PillKind = 'ai' | 'teacher' | 'premium' | 'points' | 'soon';

const styles: Record<PillKind, { box: string; text: string; color: ColorName; icon?: IconName }> = {
  ai: { box: 'bg-info-bg', text: 'text-info', color: 'info' },
  teacher: { box: 'bg-ok-bg', text: 'text-ok', color: 'ok', icon: 'check' },
  premium: { box: 'bg-spot', text: 'text-honey', color: 'honey', icon: 'lock' },
  points: { box: 'bg-raised', text: 'text-honey-text', color: 'honey-text', icon: 'drop' },
  soon: { box: 'bg-wax', text: 'text-lock-ink', color: 'lock-ink', icon: 'clock' },
};

/** micro.pill B: the old face turns away in 160ms, the new one lands in 200ms, then the check draws. */
const FLIP_OUT = 160;
const FLIP_IN = 200;
const CHECK_DELAY = 160;

type Pill = { kind: PillKind; label: string };

type StatusPillProps = Pill & { className?: string };

/**
 * 30pt pill with an icon; the AI pill carries a small hexagon instead. When a teacher approves
 * AI text, the pill flips like a split-flap board and the check draws (micro.pill B ·
 * Çevrilmə); other changes cross-fade.
 */
export function StatusPill({ kind, label, className }: StatusPillProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotionPref();
  const [shown, setShown] = useState<Pill>({ kind, label });
  const flipping = useRef(false);
  const turn = useSharedValue(0);
  const fade = useSharedValue(1);
  const draw = useSharedValue(0);

  useEffect(() => {
    if (shown.kind === kind && shown.label === label) return;
    const next = { kind, label };
    if (!reduced && shown.kind === 'ai' && kind === 'teacher') {
      flipping.current = true;
      turn.set(
        withTiming(90, { duration: FLIP_OUT, easing: easing.away }, (finished) => {
          if (finished) scheduleOnRN(setShown, next);
        }),
      );
      return;
    }
    fade.set(
      withTiming(
        0,
        { duration: reduced ? duration.reduced / 2 : duration.quick, easing: easing.away },
        (finished) => {
          if (finished) scheduleOnRN(setShown, next);
        },
      ),
    );
  }, [kind, label, shown, reduced, turn, fade]);

  // The new face is on screen (edge-on or faded out): bring it in.
  useEffect(() => {
    if (flipping.current) {
      flipping.current = false;
      playCue('complete');
      draw.set(
        withSequence(
          withTiming(CHECK_LENGTH, { duration: 0 }),
          withDelay(CHECK_DELAY, withTiming(0, { duration: duration.base, easing: easing.enter })),
        ),
      );
      turn.set(
        withSequence(
          withTiming(-90, { duration: 0 }),
          withTiming(0, { duration: FLIP_IN, easing: easing.enter }),
        ),
      );
      return;
    }
    fade.set(withTiming(1, { duration: reduced ? duration.reduced : duration.base }));
  }, [shown, reduced, turn, fade, draw]);

  const face = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ perspective: 400 }, { rotateX: `${turn.value}deg` }],
  }));
  const check = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));
  const s = styles[shown.kind];

  return (
    <AnimatedView
      style={face}
      className={cn(
        'h-[30px] flex-row items-center gap-1.5 self-start rounded-full px-2.5',
        s.box,
        className,
      )}
    >
      {shown.kind === 'ai' ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={14} height={16}>
            <Polygon points="7,0 14,4 14,12 7,16 0,12 0,4" fill={colors[s.color]} />
          </Svg>
        </View>
      ) : shown.kind === 'teacher' ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <AnimatedPath
              d={CHECK_PATH}
              fill="none"
              stroke={colors.ok}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={CHECK_LENGTH}
              animatedProps={check}
            />
          </Svg>
        </View>
      ) : s.icon ? (
        <Icon name={s.icon} size={16} color={s.color} />
      ) : null}
      <Text accessibilityLiveRegion="polite" className={cn('font-sans-black text-sm', s.text)}>
        {shown.label}
      </Text>
    </AnimatedView>
  );
}
