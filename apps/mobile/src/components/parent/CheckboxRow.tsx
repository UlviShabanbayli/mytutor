import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { HexCheckbox } from '@/components/ui';

type CheckboxRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Plain-text name of the checkbox for screen readers. */
  accessibilityLabel: string;
  children: ReactNode;
};

/** A honeycomb checkbox with its sentence; the whole row toggles it (micro.check C). */
export function CheckboxRow({ checked, onChange, accessibilityLabel, children }: CheckboxRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      className="min-h-[44px] flex-row items-start gap-3"
    >
      <View className="mt-px">
        <HexCheckbox checked={checked} size={26} />
      </View>
      <View className="min-w-0 flex-1">{children}</View>
    </Pressable>
  );
}
