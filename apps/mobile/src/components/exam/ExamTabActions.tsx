import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui';

/** The exam tab's calendar and goal buttons, shown once there is a goal to plan for. */
export function ExamTabActions() {
  const { t } = useTranslation();

  return (
    <>
      <IconButton
        icon="calendar"
        variant="outlined"
        accessibilityLabel={t('exam.tab.deadlines')}
        onPress={() => router.push('/exam/deadlines')}
      />
      <IconButton
        icon="target"
        variant="outlined"
        accessibilityLabel={t('exam.tab.changeGoal')}
        onPress={() => router.push('/exam/setup')}
      />
    </>
  );
}
