import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';

type LockedNoteProps = { text: string; actionLabel: string; onPress: () => void };

/** A dashed row saying what is locked and the one step that unlocks it. */
export function LockedNote({ text, actionLabel, onPress }: LockedNoteProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text} ${actionLabel}`}
      onPress={onPress}
      className="min-h-[44px] flex-row items-center gap-2 rounded-md border border-dashed border-border px-2.5 py-1 active:bg-raised"
    >
      <Icon name="lock" size={16} color="lock-ink" />
      <Text variant="caption" tone="muted" className="flex-1 font-sans">
        {text}
      </Text>
      <View className="flex-row items-center">
        <Text className="font-sans-black text-sm text-honey-text">{actionLabel}</Text>
        <Icon name="chevron" size={16} color="honey-text" />
      </View>
    </Pressable>
  );
}
