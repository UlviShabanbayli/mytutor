import { Clapperboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';

/** Placeholder: lesson planning starts only after the knowledge document is reviewed. */
export function LessonTab() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<Clapperboard className="size-6" />}
      title={t('lesson.title')}
      body={t('lesson.body')}
    />
  );
}
