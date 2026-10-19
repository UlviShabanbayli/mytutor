import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexCell, Text } from '@/components/ui';
import { unitStats, type UnitNote } from '@/features/parent/report';
import type { UnitProgress } from '@/features/parent/types';

type UnitRowProps = { unit: UnitProgress };

/** One frame (çərçivə): its number cell, title, count and a strip of its topic cells. */
export function UnitRow({ unit }: UnitRowProps) {
  const { t } = useTranslation();
  const stats = unitStats(unit);
  const noteText = (note: UnitNote) => {
    switch (note.kind) {
      case 'practice':
        return t('parent.subject.note.practice', { count: note.count });
      case 'learning':
        return t('parent.subject.note.learning', { count: note.count });
      case 'remaining':
        return t('parent.subject.note.remaining', { count: note.count });
      case 'all':
        return t('parent.subject.note.all');
      case 'notStarted':
        return t('parent.subject.note.notStarted');
    }
  };
  const note = noteText(stats.note);

  return (
    <View
      accessible
      accessibilityLabel={t('parent.subject.unitAria', {
        number: unit.number,
        title: unit.title,
        total: stats.total,
        done: stats.done,
        note,
      })}
      className="flex-row items-center gap-2.5 rounded-lg border border-border bg-surf px-3 py-2"
    >
      <HexCell state={stats.level} size={34} label={unit.number} />
      <View className="min-w-0 flex-1 gap-[5px]">
        <View className="flex-row items-baseline gap-2">
          <Text className="min-w-0 flex-1 font-sans-black text-sm">{unit.title}</Text>
          <Text className="font-sans-black text-sm text-honey-text">
            {`${stats.done} / ${stats.total}`}
          </Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-[3px]">
          {unit.topics.map((topic) => (
            <HexCell key={topic.number} state={topic.level} size={16} />
          ))}
          <Text className="ml-1.5 min-w-0 shrink font-sans-semibold text-xs text-muted">
            {note}
          </Text>
        </View>
      </View>
    </View>
  );
}
