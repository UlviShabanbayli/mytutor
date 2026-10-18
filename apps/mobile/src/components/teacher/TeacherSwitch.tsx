import { Platform, Switch } from 'react-native';
import { useThemeColors } from '@/theme';

type TeacherSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** The platform switch in the design's colors: honey track when on, wax when off. */
export function TeacherSwitch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled,
}: TeacherSwitchProps) {
  const colors = useThemeColors();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.wax, true: colors.honey }}
      thumbColor={colors.surf}
      // The web switch draws its own active thumb color unless told.
      {...(Platform.OS === 'web' ? { activeThumbColor: colors.surf } : null)}
      ios_backgroundColor={colors.wax}
    />
  );
}
