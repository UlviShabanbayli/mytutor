import { Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type MistakeFilter = { kind: 'all' } | { kind: 'week' } | { kind: 'subject'; id: string };

type MistakeFiltersProps = {
  subjects: { id: string; title: string }[];
  value: MistakeFilter;
  onChange: (filter: MistakeFilter) => void;
};

const same = (a: MistakeFilter, b: MistakeFilter) =>
  a.kind === b.kind && (a.kind !== 'subject' || (b.kind === 'subject' && a.id === b.id));

/** "Hamısı", one chip per subject, "Bu həftə". */
export function MistakeFilters({ subjects, value, onChange }: MistakeFiltersProps) {
  const { t } = useTranslation();
  const chips: { filter: MistakeFilter; label: string }[] = [
    { filter: { kind: 'all' }, label: t('study.mistakes.all') },
    ...subjects.map((s) => ({ filter: { kind: 'subject' as const, id: s.id }, label: s.title })),
    { filter: { kind: 'week' }, label: t('study.mistakes.thisWeek') },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t('study.mistakes.filters')}
      contentContainerClassName="gap-2"
    >
      {chips.map(({ filter, label }) => {
        const on = same(filter, value);
        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={label}
            onPress={() => onChange(filter)}
            className={cn(
              'min-h-touch justify-center rounded-full border-2 px-3.5',
              on ? 'border-honey bg-raised' : 'border-border active:bg-wax',
            )}
          >
            <Text className={cn('font-sans-black text-sm', on ? 'text-honey-text' : 'text-ink')}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
