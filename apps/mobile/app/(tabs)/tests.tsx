import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SubjectGrid } from '@/components/tests/SubjectGrid';
import { EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { useSubjects } from '@/features/tests/queries';

export default function TestsScreen() {
  const { t } = useTranslation();
  const subjects = useSubjects();

  return (
    <Screen>
      <View className="gap-1">
        <Text variant="title">{t('tests.title')}</Text>
        <Text tone="muted">{t('tests.subtitle')}</Text>
      </View>
      {subjects.isPending ? (
        <LoadingState />
      ) : subjects.isError ? (
        <ErrorState onRetry={() => void subjects.refetch()} />
      ) : subjects.data.length === 0 ? (
        <EmptyState
          icon="layers-outline"
          title={t('tests.emptyTitle')}
          description={t('tests.emptyDescription')}
        />
      ) : (
        <SubjectGrid subjects={subjects.data} />
      )}
    </Screen>
  );
}
