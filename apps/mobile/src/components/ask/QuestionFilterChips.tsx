import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { QUESTION_FILTERS, type QuestionFilter } from '@/features/ask/questions';
import { cn } from '@/lib/cn';

type QuestionFilterChipsProps = {
  value: QuestionFilter;
  counts: Record<QuestionFilter, number>;
  onChange: (filter: QuestionFilter) => void;
};

const LABEL_KEYS = {
  all: 'ask.mine.filterAll',
  waiting: 'ask.mine.filterWaiting',
  ready: 'ask.mine.filterReady',
} as const;

/** Hamısı / Gözləyir / Hazır with counts; the chosen one is the inverted `spot` chip. */
export function QuestionFilterChips({ value, counts, onChange }: QuestionFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t('ask.mine.filter')}
      className="flex-row flex-wrap gap-2"
    >
      {QUESTION_FILTERS.map((filter) => {
        const on = filter === value;
        const label = t(LABEL_KEYS[filter]);
        return (
          <Pressable
            key={filter}
            accessibilityRole="radio"
            accessibilityLabel={t('ask.mine.filterA11y', { label, count: counts[filter] })}
            accessibilityState={{ checked: on }}
            onPress={() => onChange(filter)}
            className={cn(
              'min-h-touch flex-row items-center gap-1.5 rounded-full px-3.5',
              on ? 'bg-spot' : 'border border-border bg-surf',
            )}
          >
            <Text className={cn('font-sans-black', on ? 'text-on-spot' : 'text-ink')}>{label}</Text>
            <View
              className={cn(
                'h-5 min-w-5 items-center justify-center rounded-full px-1',
                on ? 'bg-honey' : 'bg-wax',
              )}
            >
              <Text className={cn('font-sans-black text-xs', on ? 'text-on-honey' : 'text-muted')}>
                {counts[filter]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
