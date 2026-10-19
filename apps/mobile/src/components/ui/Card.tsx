import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

/** White surface with a hairline border and 20pt corners. */
export function Card({ children, className }: CardProps) {
  return (
    <View className={cn('rounded-xl border border-border bg-surf p-4', className)}>{children}</View>
  );
}
