import { View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';
import { HexTile } from './HexTile';

type PerkRowProps = {
  icon: IconName;
  title: string;
  body: string;
  /** The mocks perk stands out on the inverted `spot` tile. */
  highlight?: boolean;
};

/** One thing the exam plan gives the student (the empty state's list). */
export function PerkRow({ icon, title, body, highlight = false }: PerkRowProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surf p-3">
      <HexTile
        tone={highlight ? 'spot' : 'raised'}
        size={44}
        icon={(ink) => <Icon name={icon} size={20} color={ink} />}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-base">{title}</Text>
        <Text tone="muted" className="text-sm">
          {body}
        </Text>
      </View>
    </View>
  );
}
