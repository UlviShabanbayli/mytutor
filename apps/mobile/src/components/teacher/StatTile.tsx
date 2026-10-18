import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type StatTileProps = {
  value: string;
  label: string;
  /** `inset` sits inside a card on the page ground; `card` stands alone. */
  look?: 'card' | 'inset';
  valueClassName?: string;
  /** Makes the tile a link (e.g. completion → class report), marked with a chart icon. */
  onPress?: () => void;
  accessibilityHint?: string;
};

/** A big Unbounded number over a small muted label. */
export function StatTile({
  value,
  label,
  look = 'card',
  valueClassName,
  onPress,
  accessibilityHint,
}: StatTileProps) {
  const box = cn(
    'min-w-0 flex-1 gap-px',
    look === 'card'
      ? 'rounded-lg border border-border bg-surf px-3 py-2.5'
      : 'rounded-md bg-page px-2.5 py-2',
  );
  const content = (
    <>
      <Text
        className={cn(
          'font-display-black text-ink',
          look === 'card' ? 'text-xl' : 'text-md',
          valueClassName,
        )}
      >
        {value}
      </Text>
      <Text numberOfLines={2} className="font-sans-bold text-xs text-muted">
        {label}
      </Text>
    </>
  );

  if (!onPress)
    return (
      <View accessible accessibilityLabel={`${value} ${label}`} className={box}>
        {content}
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className={cn(box, 'active:bg-raised')}
    >
      <View className="absolute right-2 top-2">
        <Icon name="chart" size={16} color="honey-text" />
      </View>
      {content}
    </Pressable>
  );
}
