import { useTranslation } from 'react-i18next';
import type { KnowledgeItem, KnowledgeItemType, KnowledgeStatus } from '@mytutor/types';
import { SegmentedControl } from '@/components/ui';
import { type KnowledgeFilter, typeCounts } from '@/features/knowledge/items';
import { STATUSES } from './statusTone';

type KnowledgeFiltersProps = {
  items: KnowledgeItem[];
  filter: KnowledgeFilter;
  onChange: (filter: KnowledgeFilter) => void;
};

const ALL = 'all';

export function KnowledgeFilters({ items, filter, onChange }: KnowledgeFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl<KnowledgeStatus | typeof ALL>
          label={t('knowledge.filter.status')}
          value={filter.status ?? ALL}
          onChange={(v) => onChange({ ...filter, status: v === ALL ? null : v })}
          options={[
            { value: ALL, label: t('knowledge.filter.all'), count: items.length },
            ...STATUSES.map((s) => ({
              value: s,
              label: t(`knowledge.status.${s}`),
              count: items.filter((i) => i.status === s).length,
            })),
          ]}
        />
        <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={filter.failedOnly}
            onChange={(e) => onChange({ ...filter, failedOnly: e.target.checked })}
            className="size-4 accent-primary"
          />
          {t('knowledge.filter.failedOnly')}
        </label>
      </div>
      <SegmentedControl<KnowledgeItemType | typeof ALL>
        label={t('knowledge.filter.type')}
        value={filter.type ?? ALL}
        onChange={(v) => onChange({ ...filter, type: v === ALL ? null : v })}
        options={[
          { value: ALL, label: t('knowledge.filter.all') },
          ...typeCounts(items).map(([type, count]) => ({
            value: type,
            label: t(`knowledge.type.${type}`),
            count,
          })),
        ]}
      />
    </div>
  );
}
