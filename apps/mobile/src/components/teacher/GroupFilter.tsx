import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ClassGroup } from '@/features/teacher/types';
import { ChoiceChip } from './ChoiceChip';

type GroupFilterProps = {
  groups: ClassGroup[];
  total: number;
  value: string | null;
  onChange: (groupId: string | null) => void;
  onAdd: () => void;
};

/** "Hamısı · 24", one chip per group and "+ Qrup"; scrolls sideways when groups pile up. */
export function GroupFilter({ groups, total, value, onChange, onAdd }: GroupFilterProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('teacher.members.groups')}
      contentContainerClassName="gap-2"
    >
      <ChoiceChip
        label={t('teacher.members.all', { count: total })}
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {groups.map((g) => (
        <ChoiceChip
          key={g.id}
          label={t('teacher.members.group', { name: g.name, count: g.memberIds.length })}
          selected={value === g.id}
          onPress={() => onChange(g.id)}
        />
      ))}
      <ChoiceChip
        role="checkbox"
        icon="plus"
        selected={false}
        label={t('teacher.members.addGroup')}
        accessibilityLabel={t('teacher.members.addGroupLabel')}
        onPress={onAdd}
        className="border-dashed bg-transparent"
      />
    </ScrollView>
  );
}
