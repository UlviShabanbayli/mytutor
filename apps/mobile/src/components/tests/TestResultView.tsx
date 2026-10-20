import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TestResult } from '@mytutor/types';
import { FadeUp } from '@/components/feedback/FadeUp';
import { scoreC, scoreEnd } from '@/components/feedback/timelines';
import { HandoffOverlay } from '@/components/handoff/HandoffOverlay';
import { CellChange } from '@/components/study/CellChange';
import { Button, IconButton, Text } from '@/components/ui';
import { resultKicker } from '@/features/study/labels';
import {
  FIRST_REVIEW_DAYS,
  MASTERY_PERCENT,
  POINTS_PER_CORRECT,
  cellAfterTest,
} from '@/features/study/rewards';
import { scoreSteps, stepVerdict } from '@/features/study/steps';
import { useStudyStore } from '@/features/study/studyStore';
import { formatClock } from '@/features/study/time';
import type { StudyTest } from '@/features/study/types';
import { percent } from '@/features/tests/scoring';
import { TestMathContext } from '@/features/tests/testMath';
import { PremiumTeaser } from './PremiumTeaser';
import { ResultHero } from './ResultHero';
import { ResultMistakes } from './ResultMistakes';
import { ResultStats } from './ResultStats';
import type { ScoreMark } from './ScoreHexRing';

type TestResultViewProps = {
  study: StudyTest;
  result: TestResult;
};

/** The finished test: score, the topic cell's new level, stats, mistakes and what comes next. */
export function TestResultView({ study, result }: TestResultViewProps) {
  const { t } = useTranslation();
  const startedAt = useStudyStore((s) => s.testStarts[study.test.id]);
  const score = scoreSteps(study.steps, result.answers);
  const share = percent(score.correct, score.scored);
  const cell = cellAfterTest(share);
  const marks = study.steps.map((step): ScoreMark => {
    const verdict = stepVerdict(step, result.answers[step.id]);
    return verdict === 'correct' ? 'ok' : verdict === 'wrong' ? 'review' : 'pending';
  });
  const seconds = startedAt ? (new Date(result.finishedAt).getTime() - startedAt) / 1000 : null;
  const finish = () => router.dismissTo('/learn');
  const stats = [
    {
      value: t('study.common.pointsValue', { count: score.correct * POINTS_PER_CORRECT }),
      label: t('study.result.points'),
    },
    ...(seconds !== null && seconds > 0
      ? [{ value: formatClock(seconds), label: t('study.result.time') }]
      : []),
    { value: `${share}%`, label: t('study.result.accuracy') },
  ];
  const cellTitle =
    cell === 'mastered' ? t('study.result.cellMastered') : t('study.result.cellLearning');

  return (
    <TestMathContext.Provider value={study.test.math}>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-page">
        <View className="flex-row items-center justify-between pl-2 pr-4">
          <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={finish} />
          <Text variant="overline" tone="muted" className="text-xs">
            {resultKicker(t, study)}
          </Text>
        </View>
        <ScrollView contentContainerClassName="gap-3 px-4 pb-4">
          <ResultHero correct={score.correct} total={score.scored} marks={marks} />
          {study.kind === 'mistakes' ? null : (
            <CellChange
              code={study.topicCode ?? ''}
              from="lesson_completed"
              to={cell}
              accessibilityLabel={t('study.result.cellAria', {
                code: study.topicCode ?? study.test.title,
                to: cellTitle,
              })}
              title={cellTitle}
              caption={
                cell === 'mastered'
                  ? t('study.result.cellMasteredBody', { count: FIRST_REVIEW_DAYS })
                  : t('study.result.cellLearningBody', { percent: MASTERY_PERCENT })
              }
              tone="card"
              points={score.correct * POINTS_PER_CORRECT}
            />
          )}
          {/* The tiles come in after the score ring (feedback.score C). */}
          <FadeUp delay={scoreEnd(marks.length) + scoreC.outsAfter}>
            <ResultStats stats={stats} />
          </FadeUp>
          {score.pending > 0 ? (
            <Text variant="caption" tone="muted">
              {t('study.result.pending', { count: score.pending })}
            </Text>
          ) : null}
          <ResultMistakes steps={study.steps} answers={result.answers} />
          <PremiumTeaser />
        </ScrollView>
        <View className="px-4 pb-2 pt-2.5">
          <Button label={t('study.common.continue')} onPress={finish} />
        </View>
        {study.kind === 'mistakes' ? null : (
          <HandoffOverlay code={study.topicCode ?? ''} to={cell} />
        )}
      </SafeAreaView>
    </TestMathContext.Provider>
  );
}
