import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type ChatContextBarProps = {
  topicNumber: string;
  topicTitle: string;
};

/** Which topic Vızı answers about, and that the chat is private. */
export function ChatContextBar({ topicNumber, topicTitle }: ChatContextBarProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between gap-2">
      <View
        accessible
        accessibilityLabel={t('ask.chat.topic', { number: topicNumber, title: topicTitle })}
        className="h-8 min-w-0 flex-shrink flex-row items-center gap-1.5 rounded-full bg-raised px-3"
      >
        <Icon name="book" size={15} color="honey-text" />
        <Text numberOfLines={1} className="flex-shrink font-sans-black text-sm text-honey-text">
          {t('ask.chat.topicChip', { number: topicNumber, title: topicTitle })}
        </Text>
      </View>
      <View
        accessible
        accessibilityLabel={t('ask.chat.privateA11y')}
        className="flex-row items-center gap-1"
      >
        <Icon name="lock" size={13} color="muted" />
        <Text variant="caption" tone="muted" className="text-xs">
          {t('ask.chat.private')}
        </Text>
      </View>
    </View>
  );
}
