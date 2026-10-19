import { View } from 'react-native';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type CheckBoxProps = { checked: boolean; className?: string };

/** The 24pt box of a checkbox row: honey with a check when on, outlined when off. */
export function CheckBox({ checked, className }: CheckBoxProps) {
  return (
    <View
      className={cn(
        'h-[24px] w-[24px] items-center justify-center rounded-[7px]',
        checked ? 'bg-honey' : 'border-2 border-border bg-surf',
        className,
      )}
    >
      {checked ? <Icon name="check" size={16} color="on-honey" /> : null}
    </View>
  );
}
