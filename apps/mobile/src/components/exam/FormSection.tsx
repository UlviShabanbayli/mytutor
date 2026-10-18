import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

type FormSectionProps = {
  label: string;
  children: ReactNode;
};

/** A CAPS label over a group of choices. */
export function FormSection({ label, children }: FormSectionProps) {
  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="muted" accessibilityRole="header" className="text-xs">
        {label}
      </Text>
      {children}
    </View>
  );
}
