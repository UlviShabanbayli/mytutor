import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClassNoteCard } from '@/components/parent/ClassNoteCard';
import { ConversationCard } from '@/components/parent/ConversationCard';
import { IconNote } from '@/components/parent/IconNote';
import { ParentTabHeader } from '@/components/parent/ParentTabHeader';
import { QueryView } from '@/components/parent/QueryView';
import { SectionLabel } from '@/components/parent/SectionLabel';
import { Banner, EmptyState, Screen } from '@/components/ui';
import { useConversations } from '@/features/parent/queries';
import { useOnline } from '@/features/parent/useOnline';

/** "Mesajlar": the child's teachers and their class notes; each teacher opens a thread (V3). */
export default function ParentMessagesScreen() {
  const { t } = useTranslation();
  const conversations = useConversations();
  const online = useOnline();

  return (
    <Screen>
      <ParentTabHeader title={t('parent.messages.title')} />
      {online ? null : <Banner kind="offline" message={t('parent.messages.offline')} />}
      <QueryView query={conversations}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState
              moment="aiThinking"
              title={t('parent.messages.emptyTitle')}
              description={t('parent.messages.emptyBody')}
            />
          ) : (
            <View className="gap-3">
              <IconNote icon="eye" text={t('parent.messages.privacy')} />
              <View className="gap-2">
                <SectionLabel>{t('parent.messages.teachers')}</SectionLabel>
                {list.map((c) => (
                  <ConversationCard key={c.threadId} conversation={c} />
                ))}
              </View>
              {list.some((c) => c.latestNote) ? (
                <View className="gap-2">
                  <SectionLabel>{t('parent.messages.classNotes')}</SectionLabel>
                  {list.map((c) =>
                    c.latestNote ? (
                      <ClassNoteCard key={c.latestNote.id} note={c.latestNote} />
                    ) : null,
                  )}
                </View>
              ) : null}
            </View>
          )
        }
      </QueryView>
    </Screen>
  );
}
