import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { mockHref } from '@/features/exam/links';
import { useMockRunStore } from '@/features/exam/mockRunStore';
import { useMocks } from '@/features/exam/queries';
import { useExamStore } from '@/features/exam/store';
import { GeneralMockCard } from './GeneralMockCard';
import { MockRow } from './MockRow';

/** Sınaqlar: the scheduled general mock with registration, and the self-paced variants. */
export function MocksView() {
  const { t } = useTranslation();
  const query = useMocks();
  const registered = useExamStore((s) => s.registeredMocks);
  const registerMock = useExamStore((s) => s.registerMock);
  const attempts = useMockRunStore((s) => s.attempts);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const { scheduled, list } = query.data;
  const open = (id: string) => router.push(mockHref(id));

  return (
    <View className="gap-2.5">
      <GeneralMockCard
        mock={scheduled}
        registered={registered.includes(scheduled.id)}
        onRegister={() => {
          registerMock(scheduled.id);
          open(scheduled.id);
        }}
        onOpenRules={() => open(scheduled.id)}
      />
      <View className="mt-1 gap-0.5">
        <Text variant="heading" className="text-md">
          {t('exam.mocks.selfTitle')}
        </Text>
        <Text tone="muted" className="text-sm">
          {t('exam.mocks.selfBody')}
        </Text>
      </View>
      {list.length === 0 ? (
        <EmptyState title={t('exam.mocks.emptyTitle')} description={t('exam.mocks.emptyBody')} />
      ) : (
        list.map((item) => (
          <MockRow
            key={item.id}
            item={item}
            attempt={attempts[item.id]}
            onPress={() => open(item.id)}
          />
        ))
      )}
    </View>
  );
}
