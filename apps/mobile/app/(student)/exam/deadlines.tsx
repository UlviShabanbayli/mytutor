import { useTranslation } from 'react-i18next';
import { DeadlinesView } from '@/components/exam/DeadlinesView';
import { Screen, ScreenHeader } from '@/components/ui';

/** Tarixlər: every exam-related date in one calendar, with reminders. */
export default function ExamDeadlinesScreen() {
  const { t } = useTranslation();

  return (
    <Screen className="gap-2">
      <ScreenHeader title={t('exam.deadlines.title')} />
      <DeadlinesView />
    </Screen>
  );
}
