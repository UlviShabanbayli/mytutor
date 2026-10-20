import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PopIn } from '@/components/feedback/PopIn';
import { RisingPanel } from '@/components/feedback/RisingPanel';
import { correctB } from '@/components/feedback/timelines';
import { ViziPeek } from '@/components/feedback/ViziPeek';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, SourceLine, StatusPill, Text } from '@/components/ui';
import { EXERCISE_POINTS } from '@/features/study/rewards';
import type { LessonExercise } from '@/features/study/types';
import { cn } from '@/lib/cn';

export type ExerciseOutcome = 'same' | 'different' | 'shown';

type ExerciseSheetProps = {
  exercise: LessonExercise;
  outcome: ExerciseOutcome;
  onRetry: () => void;
  onContinue: () => void;
};

// A different answer gets the warm surface and Vızı peeking over the edge (feedback.wrong C).
const look = {
  same: { box: 'bg-ok-bg', moment: 'correct', title: 'sameTitle', body: 'sameBody' },
  different: { box: 'bg-raised', moment: null, title: 'differentTitle', body: 'differentBody' },
  shown: { box: 'bg-raised', moment: 'aiExplains', title: 'shownTitle', body: 'shownBody' },
} as const;

/**
 * After "Yoxla" or "Kitabın cavabını göstər": the verdict, the book's answer and its source. Same
 * as the book: the panel springs up and "+5 bal" pops (feedback.correct B); different: it rises
 * calmly and Vızı peeks over its edge (feedback.wrong C).
 */
export function ExerciseSheet({ exercise, outcome, onRetry, onContinue }: ExerciseSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const l = look[outcome];
  const same = outcome === 'same';

  return (
    <RisingPanel
      at={0}
      springy={same}
      tone={l.box}
      overlay={outcome === 'different' ? <ViziPeek panelAt={0} /> : null}
    >
      <View
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        className="gap-3 px-4 pt-4"
        // The sheet runs under the home indicator; its content stays above it.
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
      >
        <View className={cn('flex-row items-center gap-2.5', !l.moment && 'pr-[60px]')}>
          {l.moment ? (
            <PopIn delay={same ? correctB.badgeAt : 0} from={same ? 0 : 1}>
              <Mascot moment={l.moment} size={64} decorative />
            </PopIn>
          ) : null}
          <View className="min-w-0 flex-1 gap-0.5">
            <Text variant="heading" className={cn('font-display-black text-lg', same && 'text-ok')}>
              {t(`study.lesson.${l.title}`)}
            </Text>
            <Text className="text-sm">{t(`study.lesson.${l.body}`)}</Text>
          </View>
          {same ? (
            <PopIn delay={correctB.pillAt} duration={correctB.pill} from={correctB.pillFrom}>
              <StatusPill
                kind="points"
                label={t('study.common.points', { count: EXERCISE_POINTS })}
              />
            </PopIn>
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
          {same ? null : (
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
    </RisingPanel>
  );
}
