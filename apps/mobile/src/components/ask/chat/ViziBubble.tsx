import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, StatusPill, Text } from '@/components/ui';
import type { ChatMessage } from '@/features/ask/types';
import { RichText } from './RichText';

type ViziBubbleProps = {
  message: Extract<ChatMessage, { role: 'vizi' }>;
};

/**
 * Vızı's reply, always marked as AI. Replies with textbook content end with their lesson
 * links, "AI cavabıdır, səhv ola bilər" and the source line.
 */
export function ViziBubble({ message }: ViziBubbleProps) {
  const { t } = useTranslation();
  const label = t(`ask.chat.label.${message.kind}`);
  const plain = message.paragraphs.map((p) => p.replaceAll('**', '')).join(' ');

  return (
    <View className="gap-1 self-start">
      <View
        accessible
        accessibilityLabel={`${t('ask.chat.title')}, ${label}: ${plain}`}
        className="max-w-[88%] gap-1.5 self-start rounded-xl rounded-bl-[4px] border border-border bg-surf px-3.5 pb-3 pt-2.5"
      >
        <StatusPill kind="ai" label={label} />
        {message.paragraphs.map((p, i) => (
          <RichText key={i} text={p} />
        ))}
      </View>
      {message.sources.length > 0 ? (
        <View className="flex-row flex-wrap gap-x-1.5">
          {message.sources.map((s) => (
            <Pressable
              key={s.label}
              accessibilityRole="link"
              accessibilityLabel={t('ask.chat.sourceChipA11y', { label: s.label })}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: s.lessonId } })}
              className="min-h-touch justify-center"
            >
              <View className="h-8 flex-row items-center gap-1.5 rounded-full bg-info-bg px-2.5">
                <Icon name="book" size={14} color="info" />
                <Text className="font-sans-bold text-sm text-info">{s.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
      {message.source ? (
        <View className="gap-0.5">
          <Text variant="caption" tone="muted" className="font-sans text-xs">
            {t('ask.chat.disclaimer')}
          </Text>
          <SourceLine source={message.source} />
        </View>
      ) : null}
    </View>
  );
}
