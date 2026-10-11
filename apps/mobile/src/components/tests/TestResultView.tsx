import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { PracticeTest, TestResult } from '@mytutor/types';
import { StatTile } from '@/components/progress/StatTile';
import { Button, Card, Icon, IconButton, Text } from '@/components/ui';
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
  const mistakes = test.questions
    .map((q, i) => ({ q, number: i + 1 }))
    .filter(({ q }) => result.answers[q.id] !== q.correctKey);
  const finish = () => router.dismissTo('/tests');

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-background">
      <View className="flex-row px-2">
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={finish} />
      </View>
      <ScrollView contentContainerClassName="gap-5 px-5 pb-5">
        <View className="items-center gap-3">
          <ScoreRing
            correct={result.correct}
            total={result.total}
            accessibilityLabel={`${scoreLabel}, ${score}%`}
          />
          <Text variant="title" className="text-center">
            {t(`result.${scoreTier(score)}`)}
          </Text>
          <Text tone="muted" className="text-center">
            {test.title}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <StatTile value={String(result.correct)} label={t('result.correctLabel')} />
          <StatTile value={String(mistakes.length)} label={t('result.wrongLabel')} />
          <StatTile value={`${score}%`} label={t('result.percentLabel')} />
        </View>
        <View className="gap-2.5">
          <Text variant="subheading" accessibilityRole="header">
            {t('result.reviewTitle')}
          </Text>
          {mistakes.length === 0 ? (
            <Card className="flex-row items-center gap-3 border-success bg-success-muted">
              <Icon name="checkmark-circle" size={24} color="success" />
              <Text className="flex-1 font-sans-bold text-success">{t('result.noMistakes')}</Text>
            </Card>
          ) : (
            <Card className="p-0">
              {mistakes.map(({ q, number }, i) => (
                <AnswerReviewItem
                  key={q.id}
                  number={number}
                  question={q}
                  answer={result.answers[q.id]}
                  divider={i < mistakes.length - 1}
                />
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
      <View className="flex-row gap-2.5 px-5 pb-2 pt-3">
        <Button
          label={t('result.finish')}
          variant="secondary"
          onPress={finish}
          className="flex-1"
        />
        <Button
          label={t('result.retry')}
          icon="refresh"
          onPress={() => {
            restart(test.id);
            router.replace({ pathname: '/test/[id]', params: { id: test.id } });
          }}
          className="flex-[1.4]"
        />
      </View>
    </SafeAreaView>
  );
}
