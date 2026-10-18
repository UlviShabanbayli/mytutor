import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconButton, Text } from '@/components/ui';
import { mockTitle } from '@/features/exam/labels';
import type { MockAttempt } from '@/features/exam/mockRunStore';
import { scoreMock } from '@/features/exam/mockScoring';
import { spentMinutes } from '@/features/exam/mockTimer';
import type { MockExam } from '@/features/exam/types';
import { MockReviewItem } from './MockReviewItem';
import { ResultStats } from './ResultStats';
import { ScoreHero } from './ScoreHero';
import { TopicBars } from './TopicBars';

type MockResultViewProps = {
  mock: MockExam;
  attempt: MockAttempt & { finishedAt: number };
};

/** The mock's result: estimated score, totals, units, what goes to the plan, the missed questions. */
export function MockResultView({ mock, attempt }: MockResultViewProps) {
  const { t } = useTranslation();
  const score = scoreMock(mock, attempt.answers);
  const weak = score.groups.filter((g) => g.level === 'weak');

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-page">
      <View className="flex-row items-center gap-1 px-2 pb-1">
        <IconButton
          icon="close"
          accessibilityLabel={t('common.close')}
          onPress={() => router.dismissTo('/exam')}
        />
        <Text variant="heading" className="min-w-0 flex-1 text-xl">
          {t('exam.result.title')}
        </Text>
        <Text tone="muted" numberOfLines={1} className="max-w-[55%] pr-2 font-sans-bold text-xs">
          {mockTitle(t, mock)}
        </Text>
      </View>
      <ScrollView contentContainerClassName="gap-2.5 px-4 pb-4 pt-0.5">
        <ScoreHero score={score.percent} />
        <ResultStats score={score} minutes={spentMinutes(attempt.startedAt, attempt.finishedAt)} />
        <TopicBars groups={score.groups} />
        {attempt.timedOut ? (
          <View className="flex-row items-center gap-2.5 rounded-lg bg-info-bg px-3 py-2.5">
            <Icon name="clock" size={20} color="info" />
            <Text className="min-w-0 flex-1 text-sm">{t('exam.result.timedOut')}</Text>
          </View>
        ) : null}
        <View
          accessibilityRole="summary"
          className="flex-row items-start gap-2.5 rounded-lg bg-ok-bg px-3 py-2.5"
        >
          <Icon name="check" size={20} color="ok" />
          <Text className="min-w-0 flex-1 text-sm">
            {weak.length > 0 ? (
              <>
                <Text className="font-sans-black text-sm">{t('exam.result.weakAdded')}</Text>
                {` ${weak.map((g) => g.group.title).join(', ')}. `}
              </>
            ) : (
              `${t('exam.result.noWeak')} `
            )}
            {score.missed.length > 0 ? t('exam.result.missedBelow') : null}
          </Text>
        </View>
        {score.missed.length > 0 ? (
          <Text variant="heading" className="mt-1 text-md">
            {t('exam.result.reviewTitle')}
          </Text>
        ) : null}
        {score.missed.map((q) => (
          <MockReviewItem
            key={q.id}
            question={q}
            number={mock.questions.indexOf(q) + 1}
            answer={attempt.answers[q.id]}
          />
        ))}
      </ScrollView>
      {/* Stacked: side by side, "SƏHVLƏRƏ BAX" wrapped to two lines at phone width. */}
      <View className="gap-2 px-4 pb-2 pt-2.5">
        <Button label={t('exam.result.mistakes')} onPress={() => router.push('/mistakes')} />
        <Button
          variant="secondary"
          size="md"
          icon="trophy"
          label={t('exam.result.leaderboard')}
          onPress={() => router.push('/exam/leaderboard')}
        />
      </View>
    </SafeAreaView>
  );
}
