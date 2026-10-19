import { useTranslation } from 'react-i18next';
import type { Subject } from '@mytutor/types';
import { SubjectTile } from '@/components/learn/SubjectTile';
import { cn } from '@/lib/cn';

type SubjectCardProps = {
  subject: Subject;
  onPress: () => void;
  className?: string;
};

/** A subject from the tests API as the design's monogram cell ("Ri", "145 sual"). */
export function SubjectCard({ subject, onPress, className }: SubjectCardProps) {
  const { t } = useTranslation();
  const available = subject.questionCount > 0;
  const meta = available
    ? t('common.questionsCount', { count: subject.questionCount })
    : t('learn.tab.preparing');

  return (
    <SubjectTile
      name={subject.title}
      monogram={subject.title.slice(0, 2)}
      meta={meta}
      ready={available}
      accessibilityLabel={`${subject.title}, ${meta}`}
      onPress={onPress}
      className={cn('flex-1', className)}
    />
  );
}
