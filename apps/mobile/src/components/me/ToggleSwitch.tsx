import { Pressable, View } from 'react-native';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

type ToggleSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
  /** `mini`: the 30×18 track of the privacy table and notification chips. */
  size?: 'md' | 'mini';
  disabled?: boolean;
};

/** The design's honey switch: a 50×30 track (on: honey, off: wax) in a 56×48 hit area. */
export function ToggleSwitch({
  value,
  onChange,
  accessibilityLabel,
  size = 'md',
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => {
        playCue('tap');
        onChange(!value);
      }}
      className="min-h-touch w-14 items-end justify-center"
    >
      <SwitchTrack on={value} size={size} />
    </Pressable>
  );
}

type SwitchTrackProps = { on: boolean; size?: 'md' | 'mini' };

/** Just the drawn track, for controls whose whole row is the switch (notification chips). */
export function SwitchTrack({ on, size = 'md' }: SwitchTrackProps) {
  const mini = size === 'mini';
  return (
    <View
      className={cn(
        'flex-row items-center rounded-full',
        mini ? 'h-[18px] w-[30px] p-0.5' : 'h-[30px] w-[50px] p-[3px]',
        on ? 'justify-end bg-honey' : 'justify-start bg-wax',
      )}
    >
      <View
        className={cn(
          'rounded-full',
          mini ? 'h-3.5 w-3.5' : 'h-6 w-6',
          on ? 'bg-surf' : 'bg-muted',
        )}
      />
    </View>
  );
}
