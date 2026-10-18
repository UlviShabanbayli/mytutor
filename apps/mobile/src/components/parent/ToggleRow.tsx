import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ToggleRowProps = {
  title: string;
  note: string;
  on: boolean;
  onChange: (on: boolean) => void;
  divider?: boolean;
};

/** A settings row with a honey switch (46×28 track) inside a 52pt hit area. */
export function ToggleRow({ title, note, on, onChange, divider = false }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={note}
      accessibilityState={{ checked: on }}
      onPress={() => onChange(!on)}
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
        <View
          className={cn(
            'h-[28px] w-[46px] flex-row items-center rounded-full p-[3px]',
            on ? 'justify-end bg-honey' : 'justify-start bg-wax',
          )}
        >
          <View className="h-[22px] w-[22px] rounded-full border border-border bg-surf" />
        </View>
      </View>
    </Pressable>
  );
}
