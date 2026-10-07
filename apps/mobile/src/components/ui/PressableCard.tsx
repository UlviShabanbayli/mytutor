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

/** Card with the same tactile edge as Button; sinks on press without shifting layout. */
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
      className={cn('rounded-lg bg-border pb-1', className)}
    >
      {({ pressed }) => (
        <View
          className={cn(
            'rounded-lg border-2 border-border bg-card p-4',
            pressed && !disabled && 'translate-y-1',
            disabled && 'opacity-60',
            contentClassName,
          )}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}
