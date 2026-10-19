import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, SourceLine, StatusPill, Text } from '@/components/ui';
import { EXERCISE_POINTS } from '@/features/study/rewards';
import type { LessonExercise } from '@/features/study/types';
import { cn } from '@/lib/cn';
import { duration } from '@/theme';

export type ExerciseOutcome = 'same' | 'different' | 'shown';

type ExerciseSheetProps = {
  exercise: LessonExercise;
  outcome: ExerciseOutcome;
  onRetry: () => void;
  onContinue: () => void;
};

const look = {
  same: { box: 'bg-ok-bg', moment: 'correct', title: 'sameTitle', body: 'sameBody' },
  different: { box: 'bg-err-bg', moment: 'wrong', title: 'differentTitle', body: 'differentBody' },
  shown: { box: 'bg-raised', moment: 'aiExplains', title: 'shownTitle', body: 'shownBody' },
} as const;

/** After "Yoxla" or "Kitabın cavabını göstər": the verdict, the book's answer and its source. */
export function ExerciseSheet({ exercise, outcome, onRetry, onContinue }: ExerciseSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const l = look[outcome];

  return (
    <Animated.View entering={FadeInDown.duration(duration.normal)}>
      <View
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        className={cn('gap-3 rounded-t-3xl px-4 pt-4', l.box)}
        // The sheet runs under the home indicator; its content stays above it.
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
      >
        <View className="flex-row items-center gap-2.5">
          <Mascot moment={l.moment} size={64} decorative />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text
              variant="heading"
              className={cn('font-display-black text-lg', outcome === 'same' && 'text-ok')}
            >
              {t(`study.lesson.${l.title}`)}
            </Text>
            <Text className="text-sm">{t(`study.lesson.${l.body}`)}</Text>
          </View>
          {outcome === 'same' ? (
            <StatusPill
              kind="points"
              label={t('study.common.points', { count: EXERCISE_POINTS })}
            />
          ) : null}
        </View>
        <View className="gap-1 rounded-lg bg-surf px-3 py-2.5">
          <Text variant="overline" tone="muted">
            {t('study.lesson.bookAnswer')}
          </Text>
          <Text className="font-sans-bold text-lg">{exercise.answer}</Text>
          <SourceLine source={exercise.source} />
        </View>
        <View className="flex-row gap-2">
          {outcome === 'same' ? null : (
            <Button
              label={t('study.lesson.tryAgain')}
              variant="secondary"
              onPress={onRetry}
              className="flex-1"
            />
          )}
          <Button label={t('study.common.continue')} onPress={onContinue} className="flex-1" />
        </View>
      </View>
    </Animated.View>
  );
}
