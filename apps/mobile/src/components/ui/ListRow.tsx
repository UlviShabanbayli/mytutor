import type { ReactNode } from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type ListRowProps = {
  icon: IconName;
  label: string;
  /** Right side: a value, a switch, a chevron… */
  accessory?: ReactNode;
  /** Draws the divider under the row (all but the last row of a group). */
  divider?: boolean;
  className?: string;
};

/** One row of a settings-style group inside a Card. */
export function ListRow({ icon, label, accessory, divider = false, className }: ListRowProps) {
  return (
    <View
      className={cn(
        'min-h-14 flex-row items-center gap-3 px-4',
        divider && 'border-b border-border',
        className,
      )}
    >
      <Icon name={icon} size={22} color="muted" />
      <Text className="flex-1 font-sans-bold">{label}</Text>
      {accessory}
    </View>
  );
}
