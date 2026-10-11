import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { RecommendedTestCard } from '@/components/home/RecommendedTestCard';
import { SubjectGrid } from '@/components/tests/SubjectGrid';
import { ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { useRecommendedTopic, useSubjects } from '@/features/tests/queries';

const HOME_SUBJECT_COUNT = 4;

export default function HomeScreen() {
  const { t } = useTranslation();
  const subjects = useSubjects();
  const recommended = useRecommendedTopic();

  return (
    <Screen>
      <View className="gap-1">
        <Text variant="title">{t('home.greeting')}</Text>
        <Text tone="muted">{t('home.subtitle')}</Text>
      </View>
      <DailyGoalCard />
      {recommended.data ? <RecommendedTestCard topic={recommended.data} /> : null}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">{t('home.subjectsTitle')}</Text>
          <Link
            href="/tests"
            className="min-h-touch px-2 py-3 font-sans-bold text-base text-primary"
          >
            {t('home.seeAll')}
          </Link>
        </View>
        {subjects.isPending ? (
          <LoadingState />
        ) : subjects.isError ? (
          <ErrorState onRetry={() => void subjects.refetch()} />
        ) : (
          <SubjectGrid subjects={subjects.data.slice(0, HOME_SUBJECT_COUNT)} />
        )}
      </View>
    </Screen>
  );
}
