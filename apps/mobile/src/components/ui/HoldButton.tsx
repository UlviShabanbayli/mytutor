import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { duration, easing } from '@/motion';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type HoldButtonProps = {
  label: string;
  icon?: IconName;
  /** Runs once the finger has held for `duration.hold`; screen readers activate it at once. */
  onHold: () => void;
  className?: string;
};

/**
 * A press that must be held (buttons.hold B): honey fills the button bottom→top while held
 * (500 ms, linear); when full, a medium tap and `onHold`. Letting go early drains it in 150 ms.
 */
export function HoldButton({ label, icon, onHold, className }: HoldButtonProps) {
  const { t } = useTranslation();
  const fill = useSharedValue(0);
  const [lit, setLit] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const fired = useRef(false);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach(clearTimeout);
  }, []);

  const fire = () => {
    fired.current = true;
    playCue('focus');
    onHold();
  };

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.get() * 100}%` }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('ui.holdHint')}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate') fire();
      }}
      onPressIn={() => {
        fired.current = false;
        cancelAnimation(fill);
        fill.set(withTiming(1, { duration: duration.hold, easing: Easing.linear }));
        // The label turns on-honey once the honey is past its middle.
        timers.current.push(setTimeout(() => setLit(true), duration.hold / 2));
        timers.current.push(setTimeout(fire, duration.hold));
      }}
      onPressOut={() => {
        clear();
        setLit(false);
        fill.set(
          withTiming(0, {
            duration: fired.current ? duration.base : duration.release,
            easing: easing.press,
          }),
        );
      }}
      className={cn(
        'min-h-touch flex-row items-center justify-center overflow-hidden rounded-md border-2 bg-surf px-[18px]',
        lit ? 'border-honey-deep' : 'border-border',
        className,
      )}
    >
      <View pointerEvents="none" className="absolute inset-0 justify-end">
        <Animated.View style={fillStyle}>
          <View className="flex-1 bg-honey" />
        </Animated.View>
      </View>
      <View className="flex-row items-center gap-2">
        {icon ? <Icon name={icon} size={20} color={lit ? 'on-honey' : 'ink'} /> : null}
        <Text className={cn('font-sans-bold', lit ? 'text-on-honey' : 'text-ink')}>{label}</Text>
      </View>
    </Pressable>
  );
}
