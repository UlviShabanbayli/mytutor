import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icon, type IconName, Text } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { duration, easing, spring, useReducedMotionPref } from '@/motion';
import { TabBadge } from './TabBadge';
import { TabCenterButton } from './TabCenterButton';

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

/**
 * One bottom-menu item: an icon in a 52×30 pill above an 11pt label. Chosen, the pill fades in
 * and the icon hops up and lands with a soft dip (buttons.tabbar C); a new unread count bumps
 * the icon (micro.badge B).
 */
export function TabBarItem({ item, focused, onPress, onLongPress }: TabBarItemProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const pill = useSharedValue(focused ? 1 : 0);
  const hop = useSharedValue(0);
  const bump = useSharedValue(0);
  const wasFocused = useRef(focused);
  const badge = item.badge ? t('tabs.badge', { count: item.badge }) : null;
  const name = [item.label, item.hint, badge].filter(Boolean).join(', ');

  useEffect(() => {
    pill.set(withTiming(focused ? 1 : 0, { duration: duration.quick, easing: easing.press }));
    if (focused && !wasFocused.current && !reduced) {
      hop.set(
        withSequence(
          withTiming(1, { duration: duration.hop, easing: easing.press }),
          withSpring(0, spring.land),
        ),
      );
    }
    wasFocused.current = focused;
  }, [focused, reduced, pill, hop]);

  const onBadgeArrive = useCallback(() => {
    if (reduced) return;
    bump.set(
      withSequence(
        withTiming(1, { duration: duration.hop, easing: easing.press }),
        withSpring(0, spring.calm),
      ),
    );
  }, [reduced, bump]);

  const pillStyle = useAnimatedStyle(() => ({ opacity: pill.get() }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * hop.get() - 3 * bump.get() }, { scale: 1 + 0.12 * hop.get() }],
  }));

  if (item.center) {
    return (
      <TabCenterButton
        icon={item.icon}
        accessibilityLabel={name}
        focused={focused}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={name}
      accessibilityState={{ selected: focused }}
      onPress={() => {
        if (!focused) playCue('select');
        onPress();
      }}
      onLongPress={onLongPress}
      className="min-h-[52px] flex-1 items-center justify-center gap-[3px]"
    >
      <View className="h-[30px] w-[52px] items-center justify-center">
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pillStyle]}>
          <View className="flex-1 rounded-full bg-raised" />
        </Animated.View>
        <Animated.View style={iconStyle}>
          <Icon name={item.icon} size={24} color={focused ? 'honey-text' : 'muted'} />
        </Animated.View>
        <TabBadge count={item.badge} onArrive={onBadgeArrive} />
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
