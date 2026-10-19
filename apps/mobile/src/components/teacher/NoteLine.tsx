import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';

type NoteLineProps = {
  icon: IconName;
  children: ReactNode;
  iconColor?: ColorName;
  className?: string;
};

/** A quiet one-line explanation under a control (privacy, rules): icon + 12.5pt muted text. */
export function NoteLine({ icon, children, iconColor = 'muted', className }: NoteLineProps) {
  return (
    <View className={cn('flex-row items-start gap-1.5', className)}>
      <View className="pt-px">
        <Icon name={icon} size={16} color={iconColor} />
      </View>
      <Text variant="caption" tone="muted" className="flex-1">
        {children}
      </Text>
    </View>
  );
}
