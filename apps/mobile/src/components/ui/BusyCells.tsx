import { View } from 'react-native';
import type { ColorName } from '@/theme';
import { BusyCell } from './BusyCell';

type BusyCellsProps = { color: ColorName };

/** Three small hex cells filling one after another: a button's busy state (buttons.loading C). */
export function BusyCells({ color }: BusyCellsProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="flex-row items-center gap-1.5"
    >
      <BusyCell index={0} color={color} />
      <BusyCell index={1} color={color} />
      <BusyCell index={2} color={color} />
    </View>
  );
}
