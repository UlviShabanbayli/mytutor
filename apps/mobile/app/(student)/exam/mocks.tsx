import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MocksView } from '@/components/exam/MocksView';
import { IconButton, Screen, ScreenHeader } from '@/components/ui';

/** Sınaqlar: the general mock and the self-paced variants. */
export default function ExamMocksScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="gap-3">
      <ScreenHeader
        title={t('exam.mocks.title')}
        actions={
          <IconButton
            icon="trophy"
            accessibilityLabel={t('exam.mocks.leaderboard')}
            onPress={() => router.push('/exam/leaderboard')}
          />
        }
      />
      <MocksView />
    </Screen>
  );
}
