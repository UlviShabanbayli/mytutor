import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { MapStatus } from '@/features/exam/mockScoring';
import { cn } from '@/lib/cn';

type MapCellProps = {
  number: number;
  status: MapStatus;
  current: boolean;
  onPress: () => void;
};

const box: Record<MapStatus, string> = {
  answered: 'border-honey bg-honey',
  flagged: 'border-honey bg-raised',
  empty: 'border-dashed border-border bg-surf',
};
const ink: Record<MapStatus, string> = {
  answered: 'text-on-honey',
  flagged: 'text-honey-text',
  empty: 'text-muted',
};

/** One question on the map: answered (check), flagged (flag icon) or empty (dashed). */
export function MapCell({ number, status, current, onPress }: MapCellProps) {
  const { t } = useTranslation();
  const label = t(current ? 'exam.map.cellCurrentA11y' : 'exam.map.cellA11y', {
    n: number,
    status: t(`exam.map.cell.${status}`),
  });

  return (
    <View
      className={cn(
        'min-w-0 flex-1 rounded-lg border-2 p-0.5',
        current ? 'border-ink' : 'border-transparent',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className={cn(
          'h-[50px] items-center justify-center rounded-md border-2 active:opacity-80',
          box[status],
        )}
      >
        <Text className={cn('font-sans-black text-base', ink[status])}>{String(number)}</Text>
        {status === 'answered' ? <Icon name="check" size={12} color="on-honey" /> : null}
        {status === 'flagged' ? <Icon name="exam" size={12} color="honey-text" /> : null}
      </Pressable>
    </View>
  );
}
