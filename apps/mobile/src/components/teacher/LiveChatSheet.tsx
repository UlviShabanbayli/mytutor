import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import { useConversations } from '@/features/teacher/queries';
import { MessageBubble } from './MessageBubble';

type LiveChatSheetProps = { visible: boolean; classId: string; onClose: () => void };

/** The class chat during the lesson (read-only until replying exists). */
export function LiveChatSheet({ visible, classId, onClose }: LiveChatSheetProps) {
  const { t } = useTranslation();
  const conversations = useConversations();
  const chat = conversations.data?.find((c) => c.kind === 'class' && c.id === `c-${classId}`);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('teacher.live.chat')}>
      <View className="gap-2">
        {chat?.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <Text variant="caption" tone="muted">
          {t('teacher.messages.replySoon')}
        </Text>
      </View>
    </Sheet>
  );
}
