import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SettingsGroupProps = { title: string; children: ReactNode; className?: string };

/** A titled block of settings rows on a white card (design "DİL VƏ GÖRÜNÜŞ"). */
export function SettingsGroup({ title, children, className }: SettingsGroupProps) {
  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="muted" accessibilityRole="header" className="mx-1 mt-1">
        {title}
      </Text>
      <View className={cn('rounded-lg border border-border bg-surf px-3', className)}>
        {children}
      </View>
    </View>
  );
}
