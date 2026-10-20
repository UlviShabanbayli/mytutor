import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { groupThousands } from '@/lib/rolling';
import { Card, Icon, type IconName, RollingNumber, Text } from '@/components/ui';

type StatTileProps = {
  label: string;
  /** A number rolls when it changes (micro.count B) and is grouped by thousands. */
  value: string | number;
  tone?: 'default' | 'ok' | 'err';
  /**
   * Honey icon before the number (design "Mən": wing, drop, cell). With an icon the number is
   * Unbounded and the label the design's 12pt bold; without one the tile looks as before.
   */
  icon?: IconName;
};

const TONE_TEXT = { default: 'text-ink', ok: 'text-ok', err: 'text-err' } as const;

export function StatTile({ label, value, tone = 'default', icon }: StatTileProps) {
  const spoken = typeof value === 'number' ? groupThousands(value) : value;
  if (!icon) {
    return (
      <Card className="flex-1 gap-0.5 p-3">
        <Text tone={tone} className="font-sans-black text-xl">
          {value}
        </Text>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      </Card>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${spoken} ${label}`}
      className="flex-1 gap-0.5 rounded-lg border border-border bg-surf p-2.5"
    >
      <View className="flex-row items-center gap-1">
        <Icon name={icon} size={18} color="honey-text" />
        {typeof value === 'number' ? (
          <RollingNumber
            value={value}
            group
            accessible={false}
            className={cn('font-display-black text-lg', TONE_TEXT[tone])}
          />
        ) : (
          <Text tone={tone} className="font-display-black text-lg">
            {value}
          </Text>
        )}
      </View>
      <Text tone="muted" className="font-sans-bold text-xs" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
