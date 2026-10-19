import { useTranslation } from 'react-i18next';
import { WeakSpotsView } from '@/components/exam/WeakSpotsView';
import { Screen, ScreenHeader } from '@/components/ui';

/** Vızının kəşfiyyatı: weak topics traced back through the topic chain. */
export default function WeakSpotsScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('exam.weak.title')} />
      <WeakSpotsView />
    </Screen>
  );
}
