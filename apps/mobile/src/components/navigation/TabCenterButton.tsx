import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { duration, easing, spring } from '@/motion';

type TabCenterButtonProps = {
  icon: IconName;
  /** The full spoken name (label, hint and unread count). */
  accessibilityLabel: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

/**
 * The raised middle action of a tab bar (student "Soruş", teacher "Yarat"): a 58×52 face on a
 * 4pt honey-deep edge that sinks like the primary button (buttons.primary A) with a medium tap.
 */
export function TabCenterButton({
  icon,
  accessibilityLabel,
  focused,
  onPress,
  onLongPress,
}: TabCenterButtonProps) {
  const sink = useSharedValue(0);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: 4 * sink.get() }] }));

  return (
    <View className="flex-1 items-center justify-center">
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: focused }}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => {
          playCue('focus');
          sink.set(withTiming(1, { duration: duration.press, easing: easing.press }));
        }}
        onPressOut={() => {
          sink.set(withSpring(0, spring.press));
        }}
        className="rounded-[18px] pb-1"
      >
        <View className="absolute inset-x-0 bottom-0 top-1 rounded-[18px] bg-honey-deep" />
        <Animated.View style={faceStyle}>
          <View
            className={cn(
              'h-[52px] w-[58px] items-center justify-center rounded-[18px]',
              focused ? 'bg-honey' : 'bg-spot',
            )}
          >
            <Icon name={icon} size={26} color={focused ? 'on-honey' : 'honey'} />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
