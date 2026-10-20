import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { cn } from '@/lib/cn';
import { useRaisedPress } from './useRaisedPress';

type PressableCardProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
};

/** Tappable card: a 2pt border-colored edge underneath; it sinks onto the edge while pressed. */
export function PressableCard({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  className,
  contentClassName,
}: PressableCardProps) {
  const press = useRaisedPress({ depth: 2 });
  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn('rounded-xl bg-border pb-0.5', disabled && 'opacity-60', className)}
    >
      <Animated.View style={press.faceStyle}>
        <View className={cn('rounded-xl border border-border bg-surf p-4', contentClassName)}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
