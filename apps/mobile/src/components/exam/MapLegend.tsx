import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { MapStatus } from '@/features/exam/mockScoring';
import { cn } from '@/lib/cn';

type MapLegendProps = {
  counts: Record<MapStatus, number>;
};

const swatch: Record<MapStatus, string> = {
  answered: 'border-honey bg-honey',
  flagged: 'border-honey bg-raised',
  empty: 'border-dashed border-border bg-surf',
};

/** What the map cells mean, with how many questions are in each state. */
export function MapLegend({ counts }: MapLegendProps) {
  const { t } = useTranslation();
  const items: MapStatus[] = ['answered', 'flagged', 'empty'];

  return (
    <View
      accessibilityLabel={t('exam.map.legendA11y')}
      className="flex-row flex-wrap gap-x-3.5 gap-y-1.5"
    >
      {items.map((status) => (
        <View key={status} className="flex-row items-center gap-1.5">
          <View
            className={cn(
              'h-5 w-5 items-center justify-center rounded-[6px] border-2',
              swatch[status],
            )}
          >
            {status === 'answered' ? <Icon name="check" size={12} color="on-honey" /> : null}
            {status === 'flagged' ? <Icon name="exam" size={12} color="honey-text" /> : null}
          </View>
          <Text tone="muted" className="font-sans-bold text-sm">
            {t(`exam.map.${status}`, { count: counts[status] })}
          </Text>
        </View>
      ))}
    </View>
  );
}
