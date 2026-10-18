import { useTranslation } from 'react-i18next';
import { ExamSetupForm } from '@/components/exam/ExamSetupForm';
import { Screen, ScreenHeader } from '@/components/ui';

/** Hədəf seçimi: the exam, its group, the target result and the daily time. */
export default function ExamSetupScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="gap-3">
      <ScreenHeader title={t('exam.setup.title')} />
      <ExamSetupForm />
    </Screen>
  );
}
