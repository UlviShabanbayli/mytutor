import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ParentChip } from './ParentChip';

type ParentTabHeaderProps = {
  title: string;
  /** The design puts the chip above the title when a right-hand action takes the row's end. */
  chipAbove?: boolean;
  action?: ReactNode;
};

/** Top of a parent tab: the 28pt title, the "Valideyn" chip and an optional action. */
export function ParentTabHeader({ title, chipAbove = false, action }: ParentTabHeaderProps) {
  return (
    <View className="flex-row items-end gap-2">
      <View className="min-w-0 flex-1 gap-1">
        {chipAbove ? <ParentChip /> : null}
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {chipAbove ? null : <ParentChip className="mb-1" />}
      {action}
    </View>
  );
}
