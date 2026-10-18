import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type ChatSuggestionsProps = {
  items: string[];
  onSend: (text: string) => void;
};

/** Ready questions that keep the chat on the lessons. */
export function ChatSuggestions({ items, onSend }: ChatSuggestionsProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityLabel={t('ask.chat.suggestions')} className="items-start gap-2">
      {items.map((text) => (
        <Pressable
          key={text}
          accessibilityRole="button"
          accessibilityLabel={text}
          onPress={() => onSend(text)}
          className="rounded-md bg-border pb-0.5"
        >
          <View className="min-h-touch flex-row items-center gap-2 rounded-md border-2 border-border bg-surf px-3.5 py-2">
            <Icon name="chevron" size={16} color="honey-text" />
            <Text className="flex-shrink font-sans-bold">{text}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
