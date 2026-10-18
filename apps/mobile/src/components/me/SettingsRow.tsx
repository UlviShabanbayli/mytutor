import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SettingsRowProps = {
  icon: IconName;
  label: string;
  value?: string;
  divider?: boolean;
  /** Pressable row with a chevron; without it the row holds `accessory` (a picker). */
  onPress?: () => void;
  accessory?: ReactNode;
};

/** One settings row: icon, label, then a value with a chevron or an inline control. */
export function SettingsRow({ icon, label, value, divider, onPress, accessory }: SettingsRowProps) {
  const content = (
    <>
      <Icon name={icon} size={20} color="muted" />
      {/* With an inline control the row may wrap it under the label on narrow phones. */}
      <Text className={cn('font-sans-bold', accessory ? 'grow' : 'flex-1')}>{label}</Text>
      {value ? (
        <Text tone="muted" className="font-sans-semibold text-sm">
          {value}
        </Text>
      ) : null}
      {accessory}
      {onPress ? <Icon name="chevron" size={18} color="muted" /> : null}
    </>
  );
  const className = cn(
    'min-h-[52px] flex-row items-center gap-x-2.5 py-1',
    accessory !== undefined && 'flex-wrap gap-y-1.5',
    divider && 'border-t border-border',
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      className={cn(className, 'active:opacity-70')}
    >
      {content}
    </Pressable>
  ) : (
    <View className={className}>{content}</View>
  );
}
