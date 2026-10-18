import { View } from 'react-native';
import { IconButton, Text } from '@/components/ui';
import type { SummaryRow } from '@/features/onboarding/types';
import { cn } from '@/lib/cn';
import { HexTile } from './HexTile';

type ReadySummaryProps = {
  rows: SummaryRow[];
  accessibilityLabel: string;
};

/** The first-launch answers in one card, each with a pencil to go back and change it. */
export function ReadySummary({ rows, accessibilityLabel }: ReadySummaryProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="rounded-xl border border-border bg-surf py-1 pl-3.5 pr-1.5"
    >
      {rows.map((row, i) => (
        <View
          key={row.label}
          className={cn(
            'flex-row items-center gap-3 py-2',
            i < rows.length - 1 && 'border-b border-border',
          )}
        >
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <HexTile size={36} fill="raised">
              <Text className="font-sans-black text-sm" tone="honey">
                {row.key}
              </Text>
            </HexTile>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-bold text-xs" tone="muted">
              {row.label}
            </Text>
            <Text className="font-sans-black">{row.value}</Text>
          </View>
          <IconButton
            icon="edit"
            color="muted"
            accessibilityLabel={row.editLabel}
            onPress={row.onEdit}
          />
        </View>
      ))}
    </View>
  );
}
