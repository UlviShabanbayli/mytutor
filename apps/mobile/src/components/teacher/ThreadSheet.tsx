import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import type { Conversation } from '@/features/teacher/types';
import { MessageBubble } from './MessageBubble';
import { SmallButton } from './SmallButton';

type ThreadSheetProps = { conversation: Conversation | null; onClose: () => void };

/** The latest messages of a conversation; replying and reporting arrive with the chat screen. */
export function ThreadSheet({ conversation, onClose }: ThreadSheetProps) {
  const { t } = useTranslation();
  const [reported, setReported] = useState(false);
  const close = () => {
    setReported(false);
    onClose();
  };

  return (
    <Sheet visible={conversation !== null} onClose={close} title={conversation?.title ?? ''}>
      <View className="gap-2">
        {conversation?.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <Text variant="caption" tone="muted" className="pt-1">
          {reported ? t('teacher.soon.helpBody') : t('teacher.messages.replySoon')}
        </Text>
        <SmallButton
          variant="ghost"
          icon="warning"
          label={t('teacher.messages.report')}
          onPress={() => setReported(true)}
        />
      </View>
    </Sheet>
  );
}
