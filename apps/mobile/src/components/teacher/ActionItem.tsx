import { Pressable, View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ActionItemProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Why it is unavailable, shown under the label. */
  disabledReason?: string;
  danger?: boolean;
  role?: 'menuitem' | 'checkbox';
  checked?: boolean;
};

/** One 48pt row of an action sheet; danger rows are red. */
export function ActionItem({
  icon,
  label,
  onPress,
  disabledReason,
  danger = false,
  role = 'menuitem',
  checked,
}: ActionItemProps) {
  const disabled = disabledReason !== undefined;

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={disabledReason ? `${label}. ${disabledReason}` : label}
      accessibilityState={{ disabled, checked }}
      disabled={disabled}
      onPress={onPress}
      className="min-h-touch flex-row items-center gap-2.5 rounded-sm px-2.5 active:bg-raised"
    >
      <Icon name={icon} size={18} color={disabled ? 'lock-ink' : danger ? 'err' : 'ink'} />
      <View className="min-w-0 flex-1 py-1">
        <Text
          className={cn(
            'font-sans-bold text-sm',
            disabled ? 'text-lock-ink' : danger ? 'text-err' : 'text-ink',
          )}
        >
          {label}
        </Text>
        {disabledReason ? (
          <Text variant="caption" tone="lock" className="font-sans text-xs">
            {disabledReason}
          </Text>
        ) : null}
      </View>
      {checked !== undefined ? (
        <Icon name={checked ? 'check' : 'plus'} size={18} color={checked ? 'ok' : 'muted'} />
      ) : null}
    </Pressable>
  );
}
