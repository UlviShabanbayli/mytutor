import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export type TabItem = {
  /** The route name inside the tabs layout. */
  name: string;
  label: string;
  icon: IconName;
  /** Unread count shown as a red dot with a number. */
  badge?: number;
  /** The raised middle action (student "Soruş", teacher "Yarat"). */
  center?: boolean;
  /** Spoken description of the centre action. */
  hint?: string;
};

type TabBarItemProps = {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

/** One bottom-menu item: an icon in a 52×30 pill (raised when active) above an 11pt label. */
export function TabBarItem({ item, focused, onPress, onLongPress }: TabBarItemProps) {
  const { t } = useTranslation();
  const badge = item.badge ? t('tabs.badge', { count: item.badge }) : null;
  const name = [item.label, item.hint, badge].filter(Boolean).join(', ');

  if (item.center) {
    return (
      <View className="flex-1 items-center justify-center">
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel={name}
          accessibilityState={{ selected: focused }}
          onPress={onPress}
          onLongPress={onLongPress}
          className="rounded-[18px] bg-honey-deep pb-1"
        >
          {({ pressed }) => (
            <View
              className={cn(
                'h-[52px] w-[58px] items-center justify-center rounded-[18px]',
                focused ? 'bg-honey' : 'bg-spot',
                pressed && 'translate-y-1',
              )}
            >
              <Icon name={item.icon} size={26} color={focused ? 'on-honey' : 'honey'} />
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={name}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      className="min-h-[52px] flex-1 items-center justify-center gap-[3px]"
    >
      <View
        className={cn(
          'h-[30px] w-[52px] items-center justify-center rounded-full',
          focused && 'bg-raised',
        )}
      >
        <Icon name={item.icon} size={24} color={focused ? 'honey-text' : 'muted'} />
        {item.badge ? (
          <View className="absolute -top-[3px] right-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surf bg-err px-1">
            <Text className="font-sans-black text-2xs text-surf">{item.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        className={cn(
          'text-2xs',
          focused ? 'font-sans-black text-honey-text' : 'font-sans-bold text-muted',
        )}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}
