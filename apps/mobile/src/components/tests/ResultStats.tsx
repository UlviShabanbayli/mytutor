import { View } from 'react-native';
import { Text } from '@/components/ui';

type ResultStatsProps = {
  stats: { value: string; label: string }[];
};

/** Three raised tiles: points, minutes, share of right answers. */
export function ResultStats({ stats }: ResultStatsProps) {
  return (
    <View className="flex-row gap-2">
      {stats.map((s) => (
        <View
          key={s.label}
          accessible
          accessibilityLabel={`${s.value} ${s.label}`}
          className="flex-1 gap-0.5 rounded-lg bg-raised p-2.5"
        >
          <Text tone="honey" className="font-display-black text-lg">
            {s.value}
          </Text>
          <Text variant="caption" tone="muted" className="font-sans-bold text-xs">
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
