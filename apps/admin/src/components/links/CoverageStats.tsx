import { useTranslation } from 'react-i18next';
import type { CurriculumStandard } from '@mytutor/types';
import { StatCard } from '@/components/ui';
import type { Coverage } from '@/features/curriculum/links';

type CoverageStatsProps = {
  coverage: Coverage;
  topicCount: number;
  standards: CurriculumStandard[];
};

/** How much of the book is linked, and how much of the curriculum the book covers. */
export function CoverageStats({ coverage, topicCount, standards }: CoverageStatsProps) {
  const { t } = useTranslation();
  const covered = standards.filter((s) => coverage.topicsByCode.has(s.code)).length;
  const uncovered = standards.length - covered;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label={t('links.stats.topics')}
        value={`${coverage.linkedTopics}/${topicCount}`}
        tone={coverage.linkedTopics === topicCount ? 'success' : 'accent'}
      />
      <StatCard
        label={t('links.stats.covered')}
        value={`${covered}/${standards.length}`}
        tone={uncovered === 0 ? 'success' : 'primary'}
      />
      <StatCard
        label={t('links.stats.uncovered')}
        value={uncovered}
        tone={uncovered === 0 ? 'success' : 'accent'}
      />
      <StatCard label={t('links.stats.items')} value={coverage.itemLinks} />
    </div>
  );
}
