import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn('rounded-lg border-2 border-border bg-card p-4', className)}>
      {children}
    </View>
  );
}
