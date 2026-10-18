import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

type CheckboxRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Plain-text name of the checkbox for screen readers. */
  accessibilityLabel: string;
  children: ReactNode;
};

/** A 26pt honey checkbox with its sentence; the whole row toggles it. */
export function CheckboxRow({ checked, onChange, accessibilityLabel, children }: CheckboxRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      className="min-h-[44px] flex-row items-start gap-3"
    >
      <View
        className={cn(
          'mt-px h-[26px] w-[26px] items-center justify-center rounded-[8px]',
          checked ? 'bg-honey' : 'border-2 border-border bg-surf',
        )}
      >
        {checked ? <Icon name="check" size={18} color="on-honey" /> : null}
      </View>
      <View className="min-w-0 flex-1">{children}</View>
    </Pressable>
  );
}
