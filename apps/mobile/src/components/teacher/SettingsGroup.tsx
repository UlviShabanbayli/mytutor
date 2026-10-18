import { Pressable, View } from 'react-native';
import { Icon, type IconName, ListRow } from '@/components/ui';

type SettingsGroupProps = { items: { icon: IconName; label: string; onPress: () => void }[] };

/** A card of settings rows, each opening its page or sheet. */
export function SettingsGroup({ items }: SettingsGroupProps) {
  return (
    <View className="overflow-hidden rounded-[18px] border border-border bg-surf">
      {items.map((item, i) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={item.onPress}
          className="active:bg-raised"
        >
          <ListRow
            icon={item.icon}
            label={item.label}
            divider={i < items.length - 1}
            accessory={<Icon name="chevron" size={18} color="muted" />}
          />
        </Pressable>
      ))}
    </View>
  );
}
