import { useTranslation } from 'react-i18next';
import { TabPlaceholder } from '@/components/coming-soon/TabPlaceholder';

export default function TeacherClassesScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('tabs.classes')} />;
}
