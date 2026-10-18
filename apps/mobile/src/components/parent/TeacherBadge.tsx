import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';

/** The green "Müəllim" mark next to a teacher's name. */
export function TeacherBadge() {
  const { t } = useTranslation();
  return <Badge tone="ok" icon="check" label={t('parent.messages.teacherBadge')} />;
}
