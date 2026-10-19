import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/components/ui';
import type { TopicRowData, TopicStage } from '@/features/progress/stages';

export type TopicFilter = { stage: TopicStage | 'all'; flaggedOnly: boolean };

export const matchesFilter = (topic: TopicRowData, filter: TopicFilter) =>
  (filter.stage === 'all' || topic.stage === filter.stage) &&
  (!filter.flaggedOnly || (topic.entry?.review?.openFlagged ?? 0) > 0);

type TopicFilterBarProps = {
  topics: TopicRowData[];
  filter: TopicFilter;
  onChange: (f: TopicFilter) => void;
};

/** Narrow the book's topics to one step, or to those with items still to check. */
export function TopicFilterBar({ topics, filter, onChange }: TopicFilterBarProps) {
  const { t } = useTranslation();
  const checkId = useId();
  const count = (stage: TopicStage) => topics.filter((topic) => topic.stage === stage).length;
  const stages: TopicStage[] = ['none', 'source', 'knowledge', 'review', 'approved'];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[13px] font-sans-bold text-muted-foreground">{t('bookPage.show')}</span>
      <SegmentedControl<TopicFilter['stage']>
        label={t('bookPage.filter')}
        value={filter.stage}
        onChange={(stage) => onChange({ ...filter, stage })}
        options={[
          { value: 'all', label: t('bookPage.filterAll'), count: topics.length },
          ...stages
            .filter((stage) => count(stage) > 0 || stage === 'knowledge' || stage === 'approved')
            .map((stage) => ({
              value: stage,
              label: t(`bookPage.filterStage.${stage}`),
              count: count(stage),
            })),
        ]}
      />
      <label
        htmlFor={checkId}
        className="flex min-h-11 cursor-pointer items-center gap-2 px-2 text-[13px] font-sans-bold text-foreground"
      >
        <input
          id={checkId}
          type="checkbox"
          checked={filter.flaggedOnly}
          onChange={(e) => onChange({ ...filter, flaggedOnly: e.target.checked })}
          className="size-[18px] accent-primary"
        />
        {t('bookPage.flaggedOnly')}
      </label>
    </div>
  );
}
