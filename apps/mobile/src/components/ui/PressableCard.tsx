import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
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

/** Card that navigates or acts; its surface tints while pressed. */
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
      className={cn(
        'rounded-lg border border-border bg-card p-4 active:bg-muted',
        disabled && 'opacity-60',
        className,
        contentClassName,
      )}
    >
      {children}
    </Pressable>
  );
}
