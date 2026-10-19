import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';

export type SearchFilter = 'all' | 'topics' | 'lessons' | 'questions';

type FilterChipsProps = {
  value: SearchFilter;
  total: number;
  onChange: (filter: SearchFilter) => void;
};

/** Hamısı · N / Mövzular / Dərslər / Suallar. */
export function FilterChips({ value, total, onChange }: FilterChipsProps) {
  const { t } = useLearnText();
  const filters: [SearchFilter, string][] = [
    ['all', t('learn.search.all', { count: total })],
    ['topics', t('learn.search.topics')],
    ['lessons', t('learn.search.lessons')],
    ['questions', t('learn.search.questions')],
  ];

  return (
    // The wrapper keeps the horizontal list at its own height (a ScrollView grows by default).
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={t('learn.search.filters')}
        contentContainerClassName="gap-1.5"
      >
        {filters.map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityState={{ selected: key === value }}
            accessibilityLabel={label}
            onPress={() => onChange(key)}
            className={cn(
              'h-[44px] justify-center rounded-md px-3',
              key === value ? 'bg-honey' : 'border border-border',
            )}
          >
            <Text
              className={cn(
                'font-sans-black text-sm',
                key === value ? 'text-on-honey' : 'text-ink',
              )}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
