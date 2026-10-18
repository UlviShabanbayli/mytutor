import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Text } from '@/components/ui';
import { groupAssignments, type AssignmentFilter } from '@/features/parent/report';
import type { Assignment } from '@/features/parent/types';
import { AssignmentRow } from './AssignmentRow';
import { FilterTabs } from './FilterTabs';
import { InfoCard } from './InfoCard';
import { SectionLabel } from './SectionLabel';

type AssignmentsViewProps = { items: Assignment[] };

/** The child's class assignments, open ones first, with an all / active / done filter. */
export function AssignmentsView({ items }: AssignmentsViewProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const { active, done } = groupAssignments(items);

  if (items.length === 0) {
    return (
      <EmptyState
        moment="aiThinking"
        title={t('parent.assignments.emptyTitle')}
        description={t('parent.assignments.emptyBody')}
      />
    );
  }

  const options = [
    { value: 'all', label: t('parent.assignments.filter.all', { count: items.length }) },
    { value: 'active', label: t('parent.assignments.filter.active', { count: active.length }) },
    { value: 'done', label: t('parent.assignments.filter.done', { count: done.length }) },
  ] as const;
  const groups = [
    { key: 'active', label: t('parent.assignments.groupActive'), list: active },
    { key: 'done', label: t('parent.assignments.groupDone'), list: done },
  ].filter((g) => (filter === 'all' || filter === g.key) && g.list.length > 0);

  return (
    <View className="gap-2">
      <FilterTabs
        options={options}
        value={filter}
        onChange={setFilter}
        accessibilityLabel={t('parent.assignments.filterLabel')}
      />
      {groups.length === 0 ? (
        <Text tone="muted" className="py-6 text-center">
          {t('parent.assignments.emptyFilter')}
        </Text>
      ) : (
        groups.map((group) => (
          <View key={group.key} className="gap-2">
            <SectionLabel className="mt-1.5">{group.label}</SectionLabel>
            {group.list.map((a) => (
              <AssignmentRow key={a.id} assignment={a} />
            ))}
          </View>
        ))
      )}
      <InfoCard icon="info" body={t('parent.assignments.teacherOnly')} className="mt-0.5" />
    </View>
  );
}
