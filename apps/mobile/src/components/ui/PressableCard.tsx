import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/cn';

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn('rounded-xl bg-border pb-0.5', disabled && 'opacity-60', className)}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'rounded-xl border border-border bg-surf p-4',
            pressed && 'translate-y-0.5',
            contentClassName,
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}
