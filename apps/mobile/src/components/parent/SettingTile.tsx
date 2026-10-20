import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, type IconName, Text, useRaisedPress } from '@/components/ui';
import { cn } from '@/lib/cn';

type SettingTileProps = {
  icon: IconName;
  title: string;
  value: string;
  onPress: () => void;
  className?: string;
};

/** A tappable settings tile: honey icon, bold name and the current value under it. */
export function SettingTile({ icon, title, value, onPress, className }: SettingTileProps) {
  const press = useRaisedPress({ depth: 2 });
  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      onPress={onPress}
      className={cn('min-w-0 flex-1 rounded-lg bg-border pb-0.5', className)}
    >
      <Animated.View style={press.faceStyle}>
        <View
          className={cn(
            'min-h-14 flex-row items-center gap-2 rounded-lg border border-border bg-surf px-2.5 py-1.5',
          )}
        >
          <Icon name={icon} size={20} color="honey-text" />
          <View className="min-w-0 flex-1">
            <Text className="font-sans-black text-sm">{title}</Text>
            <Text numberOfLines={1} className="text-xs text-muted">
              {value}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
