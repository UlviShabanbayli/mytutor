import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ContinueTestCard } from '@/components/home/ContinueTestCard';
import { DailyGoalCard } from '@/components/home/DailyGoalCard';
import { HomeHeader } from '@/components/home/HomeHeader';
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
      <HomeHeader />
      {recommended.data ? <RecommendedTestCard topic={recommended.data} /> : null}
      <ContinueTestCard />
      <DailyGoalCard />
      <View className="gap-2.5">
        <View className="flex-row items-center justify-between">
          <Text variant="subheading" accessibilityRole="header">
            {t('home.subjectsTitle')}
          </Text>
          <Link
            href="/tests"
            className="-mr-2 min-h-touch px-2 py-3 font-sans-black text-sm text-primary"
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
