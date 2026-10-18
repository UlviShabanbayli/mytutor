import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { ChatIntent } from '@/features/ask/types';
import { cn } from '@/lib/cn';

type ChatHintActionsProps = {
  onSend: (text: string, intent: ChatIntent) => void;
};

/** After a hint: the full solution only when the student asks for it, or one more hint. */
export function ChatHintActions({ onSend }: ChatHintActionsProps) {
  const { t } = useTranslation();
  const full = t('ask.chat.fullSolution');
  const another = t('ask.chat.anotherHint');
  const base = 'min-h-touch flex-row items-center gap-1.5 rounded-md border-2 px-3.5';

  return (
    <View className="flex-row flex-wrap gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={full}
        onPress={() => onSend(full, 'fullSolution')}
        className={cn(base, 'border-honey bg-raised active:opacity-80')}
      >
        <Icon name="list" size={16} color="honey-text" />
        <Text className="font-sans-black text-honey-text">{full}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={another}
        onPress={() => onSend(another, 'anotherHint')}
        className={cn(base, 'border-border active:bg-wax')}
      >
        <Text className="font-sans-bold">{another}</Text>
      </Pressable>
    </View>
  );
}
