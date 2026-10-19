import { useTranslation } from 'react-i18next';
import { TabPlaceholder } from '@/components/coming-soon/TabPlaceholder';

export default function TeacherInboxScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('tabs.inbox')} />;
}
