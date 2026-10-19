import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '@/components/ui';
import { useThemeColors } from '@/theme';

type StepperButtonProps = {
  kind: 'decrease' | 'increase';
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

/** A 48pt outlined square with minus or plus (the icon set has no minus, so it is drawn here). */
export function StepperButton({ kind, accessibilityLabel, onPress, disabled }: StepperButtonProps) {
  const colors = useThemeColors();
  const color = disabled ? colors['lock-ink'] : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled === true }}
      disabled={disabled}
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-md border-2 border-border active:bg-wax"
    >
      {kind === 'increase' ? (
        <Icon name="plus" size={22} color={disabled ? 'lock-ink' : 'ink'} />
      ) : (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      )}
    </Pressable>
  );
}
