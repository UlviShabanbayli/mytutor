import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PracticeTest, TestResult } from '@mytutor/types';
import { Button, Screen, Text } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { AnswerReviewItem } from './AnswerReviewItem';
import { ScoreRing } from './ScoreRing';

type TestResultViewProps = {
  test: PracticeTest;
  result: TestResult;
};

export function TestResultView({ test, result }: TestResultViewProps) {
  const { t } = useTranslation();
  const restart = useTestSessionStore((s) => s.restart);
  const score = percent(result.correct, result.total);
  const scoreLabel = t('result.score', { correct: result.correct, total: result.total });

  return (
    <Screen>
      <View className="items-center gap-3 pt-4">
        <Text variant="label" tone="muted">
          {test.title}
        </Text>
        <ScoreRing percent={score} accessibilityLabel={`${score}%, ${scoreLabel}`} />
        <Text variant="title" className="text-center">
          {t(`result.${scoreTier(score)}`)}
        </Text>
        <Text tone="muted">{scoreLabel}</Text>
      </View>
      <View className="gap-3">
        <Button
          label={t('result.retry')}
          icon="refresh"
          onPress={() => {
            restart(test.id);
            router.replace({ pathname: '/test/[id]', params: { id: test.id } });
          }}
        />
        <Button
          label={t('result.backToTests')}
          variant="secondary"
          onPress={() => router.dismissTo('/tests')}
        />
      </View>
      <View className="gap-3">
        <Text variant="heading">{t('result.reviewTitle')}</Text>
        {test.questions.map((q, i) => (
          <AnswerReviewItem key={q.id} number={i + 1} question={q} answer={result.answers[q.id]} />
        ))}
      </View>
    </Screen>
  );
}
