import { useTranslation } from 'react-i18next';
import { ComingSoon } from '@/components/coming-soon/ComingSoon';

export default function LessonsScreen() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t('tabs.lessons')}
      icon="play"
      heading={t('comingSoon.lessonsTitle')}
      description={t('comingSoon.lessonsDescription')}
    />
  );
}
