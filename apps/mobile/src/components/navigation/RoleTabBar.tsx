import { View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type TabItem, TabBarItem } from './TabBarItem';

type RoleTabBarProps = BottomTabBarProps & {
  items: TabItem[];
  /** Names the menu for screen readers, e.g. "Əsas menyu". */
  menuLabel: string;
};

/**
 * The bottom menu of a role (student 5 tabs with "Soruş" in the middle, teacher 5 with "Yarat",
 * parent 3). Tab presses go through the navigator's events, so screens may intercept them.
 */
export function RoleTabBar({ state, navigation, items, menuLabel }: RoleTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={menuLabel}
      className="flex-row border-t border-border bg-surf px-1.5 pt-1.5"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {state.routes.map((route, index) => {
        const item = items.find((i) => i.name === route.name);
        if (!item) return null;
        const focused = state.index === index;
        return (
          <TabBarItem
            key={route.key}
            item={item}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented)
                navigation.navigate(route.name, route.params);
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}
