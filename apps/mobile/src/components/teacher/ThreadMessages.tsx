import { useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingState, Text } from '@/components/ui';
import { useReadThread } from '@/features/teacher/mutations';
import { useThread } from '@/features/teacher/queries';
import { MessageBubble } from './MessageBubble';
import { ThreadComposer } from './ThreadComposer';

type ThreadMessagesProps = { threadId: string };

/** A conversation's messages, oldest first, with the reply field under them. */
export function ThreadMessages({ threadId }: ThreadMessagesProps) {
  const { t } = useTranslation();
  const thread = useThread(threadId);
  const read = useReadThread();
  const unread = thread.data?.unread ?? 0;
  const { mutate } = read;

  // Opening the conversation reads it: the parent or student sees "Oxundu".
  useEffect(() => {
    if (unread > 0) mutate(threadId);
  }, [unread, threadId, mutate]);

  if (thread.isPending) return <LoadingState />;
  if (thread.isError) return <ErrorState onRetry={() => void thread.refetch()} />;
  return (
    <View className="gap-2">
      {thread.data.messages.length === 0 ? (
        <Text tone="muted">{t('teacher.messages.emptyThread')}</Text>
      ) : null}
      {thread.data.messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <ThreadComposer threadId={threadId} />
    </View>
  );
}
