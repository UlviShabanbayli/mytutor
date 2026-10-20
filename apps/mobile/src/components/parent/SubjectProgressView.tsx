import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { subjectTotals } from '@/features/parent/report';
import type { SubjectProgress } from '@mytutor/types';
import type { ChildView } from '@/features/parent/types';
import { LockedNote } from './LockedNote';
import { RecentTestsCard } from './RecentTestsCard';
import { SectionLabel } from './SectionLabel';
import { SubjectSummaryCard } from './SubjectSummaryCard';
import { UnitRow } from './UnitRow';

type SubjectProgressViewProps = { child: ChildView; subject: SubjectProgress };

/** A textbook's hive box from the parent's side: frames, cells, recent tests, the exam plan. */
export function SubjectProgressView({ child, subject }: SubjectProgressViewProps) {
  const { t } = useTranslation();
  const totals = subjectTotals(subject.units);

  return (
    <View className="gap-2.5">
      <SubjectSummaryCard done={totals.done} total={totals.total} />
      <View className="gap-1.5">
        <SectionLabel>{t('parent.subject.units')}</SectionLabel>
        {subject.units.map((unit) => (
          <UnitRow key={unit.number} unit={unit} />
        ))}
      </View>
      <RecentTestsCard tests={subject.recentTests} />
      {child.grants.includes('exam') ? null : (
        <LockedNote
          variant="boxed"
          title={t('parent.subject.examLockedTitle', { name: child.name })}
          body={t('parent.subject.examLockedBody')}
        />
      )}
    </View>
  );
}
