import { Pressable, View } from 'react-native';
import { SwitchTrack, Text } from '@/components/ui';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';

type ToggleRowProps = {
  title: string;
  note: string;
  on: boolean;
  onChange: (on: boolean) => void;
  divider?: boolean;
};

/** A settings row with the app's honey switch; the whole 52pt row is the switch. */
export function ToggleRow({ title, note, on, onChange, divider = false }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={note}
      accessibilityState={{ checked: on }}
      onPress={() => {
        playCue('press');
        onChange(!on);
      }}
      className={cn(
        'min-h-[52px] flex-row items-center gap-2.5 py-1 pl-3 pr-1.5 active:bg-wax',
        divider && 'border-b border-border',
      )}
    >
      <View className="min-w-0 flex-1 gap-px">
        <Text className="font-sans-bold">{title}</Text>
        <Text className="text-xs text-muted">{note}</Text>
      </View>
      <View className="h-[44px] w-[52px] items-center justify-center">
        <SwitchTrack on={on} />
      </View>
    </Pressable>
  );
}
