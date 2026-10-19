import { Pressable } from 'react-native';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { type SwitchSize, SwitchTrack } from './SwitchTrack';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** `mini`: the 30×18 track of dense tables and chips. */
  size?: SwitchSize;
  disabled?: boolean;
  className?: string;
};

/**
 * The app's switch: a 50×30 honey track in a 56×48 hit area. The knob springs across
 * (buttons.switch B) with a light tap on the phone.
 */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  size = 'md',
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => {
        playCue('press');
        onValueChange(!value);
      }}
      className={cn(
        'min-h-touch w-14 items-end justify-center',
        disabled && 'opacity-50',
        className,
      )}
    >
      <SwitchTrack on={value} size={size} />
    </Pressable>
  );
}
