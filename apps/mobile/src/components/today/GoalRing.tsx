import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { DrawnMark } from '@/components/feedback/DrawnMark';
import { goalC } from '@/components/feedback/timelines';
import { useCountUp } from '@/components/feedback/useCountUp';
import { Text } from '@/components/ui';
import type { GoalProgress } from '@/features/today/goal';
import { cn } from '@/lib/cn';
import { duration, useReducedMotionPref } from '@/motion';
import { GoalArc } from './GoalArc';
import { goalCheckAt, useGoalRingMotion } from './useGoalRingMotion';

type GoalRingProps = {
  progress: GoalProgress;
  /** 80pt on the goal card (the design draws 64; "/ 20 dəq" at 11pt needs the room). */
  size?: number;
  /** `honey`: an ink ring on a light track, for the honey goal-done screen. */
  tone?: 'card' | 'honey';
  /** Plays feedback.goal C, growing from this share (e.g. 0.75); null shows the ring as is. */
  celebrateFrom?: number | null;
};

/**
 * Minutes done today as a honey ring on wax, the number in the middle. A reached goal has a
 * honey centre with a check; feedback.goal C brings it there (a drop rides the arc, falls in,
 * honey rises, the check draws).
 */
export function GoalRing({
  progress,
  size = 80,
  tone = 'card',
  celebrateFrom = null,
}: GoalRingProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const honeyTone = tone === 'honey';
  const radius = size * 0.425;
  const stroke = size * 0.0875;
  const disc = 2 * (radius - stroke / 2 - size * 0.04);
  const playing = celebrateFrom !== null && !reduced;
  const m = useGoalRingMotion(progress.fraction, progress.complete, celebrateFrom, reduced);
  const minutes = useCountUp(progress.done, {
    from: Math.round((celebrateFrom ?? 0) * progress.goal),
    duration: duration.celebrate,
    delay: goalC.startAt,
    reduced: !playing,
  });
  const percent = Math.round(progress.fraction * 100);

  const honeyStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateY: disc * (1 - m.honey.value) }],
  }));
  const midStyle = useAnimatedStyle(() => ({ opacity: m.mid.value }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('today.goal.ringLabel', { done: progress.done, goal: progress.goal })}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      className="items-center justify-center"
      // The ring is drawn at a size given by the caller, in SVG units.
      style={{ width: size, height: size }}
    >
      <GoalArc size={size} radius={radius} stroke={stroke} honeyTone={honeyTone} motion={m} />
      {progress.complete ? (
        <View
          className="absolute overflow-hidden rounded-full"
          // The centre disc follows the ring's size.
          style={{ width: disc, height: disc }}
        >
          <Animated.View style={honeyStyle}>
            <View className={cn('flex-1', honeyTone ? 'bg-on-honey' : 'bg-honey')} />
          </Animated.View>
        </View>
      ) : null}
      <Animated.View style={midStyle}>
        <View className="items-center">
          <Text
            className={cn(
              'font-display-black text-lg leading-[20px]',
              honeyTone && 'text-on-honey',
            )}
          >
            {minutes}
          </Text>
          <Text
            className={cn(
              'font-sans-bold text-2xs leading-[13px]',
              honeyTone ? 'text-on-honey' : 'text-muted',
            )}
          >
            {t('today.goal.ringCaption', { goal: progress.goal })}
          </Text>
        </View>
      </Animated.View>
      {progress.complete ? (
        <View className="absolute">
          <DrawnMark
            kind="check"
            size={size * 0.37}
            strokeWidth={2.8}
            color={honeyTone ? 'honey' : 'on-honey'}
            delay={goalCheckAt}
            reduced={!playing}
          />
        </View>
      ) : null}
    </View>
  );
}
