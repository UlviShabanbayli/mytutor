import { View } from 'react-native';
import { HexCheckbox } from '@/components/ui';

type CheckBoxProps = { checked: boolean; className?: string };

/** The box of a checkbox row as a honeycomb cell that fills with honey (micro.check C). */
export function CheckBox({ checked, className }: CheckBoxProps) {
  return (
    <View className={className}>
      <HexCheckbox checked={checked} size={24} />
    </View>
  );
}
