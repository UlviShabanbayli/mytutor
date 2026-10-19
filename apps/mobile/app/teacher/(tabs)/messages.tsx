import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConversationRow } from '@/components/teacher/ConversationRow';
import { NoticesButton } from '@/components/teacher/NoticesButton';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TeacherTabHeader } from '@/components/teacher/TeacherTabHeader';
import { ThreadSheet } from '@/components/teacher/ThreadSheet';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { useConversations } from '@/features/teacher/queries';
import type { Conversation } from '@/features/teacher/types';

/**
 * Messages: class chats and parents (the design has no screen for this tab, so it is a list
 * built from the same parts; the conversation itself opens read-only in a sheet for now).
 */
export default function TeacherMessagesScreen() {
  const { t } = useTranslation();
  const conversations = useConversations();
  const [open, setOpen] = useState<Conversation | null>(null);

  return (
    <TeacherScreen
      header={<TeacherTabHeader title={t('teacher.messages.title')} action={<NoticesButton />} />}
      contentClassName="gap-2"
    >
      {conversations.isPending ? (
        <LoadingState />
      ) : conversations.isError ? (
        <ErrorState onRetry={() => void conversations.refetch()} />
      ) : conversations.data.length === 0 ? (
        <EmptyState
          moment="greeting"
          title={t('teacher.messages.emptyTitle')}
          description={t('teacher.messages.emptyBody')}
        />
      ) : (
        conversations.data.map((c) => (
          <ConversationRow key={c.id} conversation={c} onPress={() => setOpen(c)} />
        ))
      )}
      <ThreadSheet conversation={open} onClose={() => setOpen(null)} />
    </TeacherScreen>
  );
}
