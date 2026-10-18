import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type RadioCardProps = {
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
};

/** A big radio option: honey border and edge when chosen, a round check on the right. */
export function RadioCard({ selected, onPress, accessibilityLabel, children }: RadioCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn('rounded-[18px]', selected && 'bg-honey-deep pb-[3px]')}
    >
      <View
        className={cn(
          'flex-row items-start gap-3 rounded-[18px] border-2 p-3.5',
          selected ? 'border-honey bg-raised' : 'border-border bg-surf',
        )}
      >
        <View className="min-w-0 flex-1">{children}</View>
        <View
          className={cn(
            'mt-3 h-[26px] w-[26px] items-center justify-center rounded-full',
            selected ? 'bg-honey' : 'border-2 border-border',
          )}
        >
          {selected ? <Icon name="check" size={16} color="on-honey" /> : null}
        </View>
      </View>
    </Pressable>
  );
}
