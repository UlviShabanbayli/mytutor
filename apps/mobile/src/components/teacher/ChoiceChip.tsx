import { Pressable } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** `radio` inside a radiogroup; `checkbox` for multi-select. */
  role?: 'radio' | 'checkbox';
  accessibilityLabel?: string;
  className?: string;
};

/** 44pt chip: honey border on the raised fill when chosen, a hairline otherwise. */
export function ChoiceChip({
  label,
  selected,
  onPress,
  icon,
  role = 'radio',
  accessibilityLabel,
  className,
}: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={cn(
        'h-[44px] flex-row items-center justify-center gap-1 rounded-md border-2 px-3 active:opacity-80',
        selected ? 'border-honey bg-raised' : 'border-border bg-surf',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={16} color="honey-text" /> : null}
      <Text
        numberOfLines={1}
        className={cn('text-sm text-ink', selected ? 'font-sans-black' : 'font-sans-bold')}
      >
        {label}
      </Text>
    </Pressable>
  );
}
