import { View } from 'react-native';
import { Card, Icon, type IconName, Text } from '@/components/ui';

type StatTileProps = {
  label: string;
  value: string;
  tone?: 'default' | 'ok' | 'err';
  /**
   * Honey icon before the number (design "Mən": wing, drop, cell). With an icon the number is
   * Unbounded and the label the design's 12pt bold; without one the tile looks as before.
   */
  icon?: IconName;
};

export function StatTile({ label, value, tone = 'default', icon }: StatTileProps) {
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
      accessibilityLabel={`${value} ${label}`}
      className="flex-1 gap-0.5 rounded-lg border border-border bg-surf p-2.5"
    >
      <View className="flex-row items-center gap-1">
        <Icon name={icon} size={18} color="honey-text" />
        <Text tone={tone} className="font-display-black text-lg">
          {value}
        </Text>
      </View>
      <Text tone="muted" className="font-sans-bold text-xs" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
