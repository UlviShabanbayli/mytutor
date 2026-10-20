import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import { useConversations } from '@/features/teacher/queries';
import { ThreadMessages } from './ThreadMessages';

type LiveChatSheetProps = { visible: boolean; classId: string; onClose: () => void };

/** The class chat during the lesson: the same thread the class sees. */
export function LiveChatSheet({ visible, classId, onClose }: LiveChatSheetProps) {
  const { t } = useTranslation();
  const conversations = useConversations();
  const chat = conversations.data?.find((c) => c.kind === 'class' && c.classId === classId);

  return (
    <Sheet visible={visible} onClose={onClose} title={t('teacher.live.chat')} dragArea="handle">
      <ScrollView className="max-h-[480px]" contentContainerClassName="gap-2">
        {chat ? (
          <ThreadMessages threadId={chat.id} />
        ) : (
          <Text tone="muted">{t('teacher.messages.emptyThread')}</Text>
        )}
      </ScrollView>
    </Sheet>
  );
}
