import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sheet, Text } from '@/components/ui';
import type { Conversation } from '@/features/teacher/types';
import { SmallButton } from './SmallButton';
import { ThreadMessages } from './ThreadMessages';

type ThreadSheetProps = { conversation: Conversation | null; onClose: () => void };

/** A conversation with its messages and the reply field; reporting arrives with the chat screen. */
export function ThreadSheet({ conversation, onClose }: ThreadSheetProps) {
  const { t } = useTranslation();
  const [reported, setReported] = useState(false);
  const close = () => {
    setReported(false);
    onClose();
  };

  return (
    <Sheet
      visible={conversation !== null}
      onClose={close}
      title={conversation?.title ?? ''}
      dragArea="handle"
    >
      <ScrollView className="max-h-[480px]" contentContainerClassName="gap-2">
        {conversation ? <ThreadMessages threadId={conversation.id} /> : null}
        <View className="gap-1 pt-1">
          {reported ? (
            <Text variant="caption" tone="muted">
              {t('teacher.soon.helpBody')}
            </Text>
          ) : null}
          <SmallButton
            variant="ghost"
            icon="warning"
            label={t('teacher.messages.report')}
            onPress={() => setReported(true)}
          />
        </View>
      </ScrollView>
    </Sheet>
  );
}
