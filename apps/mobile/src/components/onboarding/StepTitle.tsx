import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type StepTitleProps = {
  title: string;
  subtitle?: ReactNode;
  className?: string;
};

/** The screen's question in Unbounded and one muted line under it. */
export function StepTitle({ title, subtitle, className }: StepTitleProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      <Text variant="title" className="text-2xl">
        {title}
      </Text>
      {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
    </View>
  );
}
