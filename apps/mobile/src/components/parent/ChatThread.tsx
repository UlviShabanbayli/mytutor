import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { Banner, Icon, Text } from '@/components/ui';
import { canCopyText, copyText, groupByDay } from '@/features/parent/chat';
import { formatDayLabel, formatTime } from '@/features/parent/format';
import type { Thread, ThreadMessage } from '@/features/parent/types';
import { useOnline } from '@/features/parent/useOnline';
import {
  useMarkThreadRead,
  useOutgoingMessages,
  useReportMessage,
  useSendMessage,
} from '@/features/parent/writes';
import { ClassNoteCard } from './ClassNoteCard';
import { IconNote } from './IconNote';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { MessageMenuSheet } from './MessageMenuSheet';

type ChatThreadProps = { thread: Thread };

/** The conversation with one teacher: class notes, messages by day, the composer (V3). */
export function ChatThread({ thread }: ChatThreadProps) {
  const { t } = useTranslation();
  const online = useOnline();
  const scroll = useRef<ScrollView>(null);
  const [menuFor, setMenuFor] = useState<ThreadMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const send = useSendMessage(thread.threadId);
  const outgoing = useOutgoingMessages(thread.threadId);
  const report = useReportMessage();
  const markRead = useMarkThreadRead();
  const now = new Date();

  useEffect(() => markRead(thread.threadId), [markRead, thread.threadId]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timer);
  }, [copied]);

  const meta = (m: ThreadMessage) =>
    m.from === 'teacher'
      ? formatTime(new Date(m.at))
      : t(m.status === 'read' ? 'parent.chat.read' : 'parent.chat.sent', {
          time: formatTime(new Date(m.at)),
        });

  return (
    <View className="flex-1">
      <ScrollView
        ref={scroll}
        className="flex-1"
        contentContainerClassName="gap-2.5 px-4 py-2.5"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        {online ? (
          <IconNote icon="eye" text={t('parent.messages.privacy')} />
        ) : (
          <View
            accessibilityRole="summary"
            className="flex-row items-center gap-2.5 rounded-md bg-info-bg px-3 py-2.5"
          >
            <Icon name="offline" size={20} color="info" />
            <Text variant="caption" className="min-w-0 flex-1 font-sans text-ink">
              <Trans
                i18nKey="parent.chat.offline"
                components={{ b: <Text className="font-sans-black text-sm text-info" /> }}
              />
            </Text>
          </View>
        )}
        {copied ? <Banner kind="info" message={t('parent.chat.copied')} /> : null}
        {thread.notes.map((note) => (
          <ClassNoteCard key={note.id} note={note} />
        ))}
        {groupByDay(thread.messages).map((group) => (
          <View key={group.key} className="gap-2.5">
            <Text className="self-center font-sans-black text-2xs uppercase tracking-[0.9px] text-muted">
              {formatDayLabel(t, group.date, now)}
            </Text>
            {group.messages.map((m) => (
              <MessageBubble
                key={m.id}
                from={m.from}
                text={m.text}
                meta={meta(m)}
                authorName={thread.name}
                reported={m.reported}
                onMenu={m.from === 'teacher' ? () => setMenuFor(m) : undefined}
              />
            ))}
          </View>
        ))}
        {outgoing.map((m) => (
          <MessageBubble
            key={m.key}
            from="me"
            text={m.text}
            meta={m.queued ? t('parent.chat.queued') : t('parent.chat.sending')}
            authorName={thread.name}
            pending
          />
        ))}
      </ScrollView>
      <MessageComposer teacherName={thread.firstName} onSend={(text) => send.mutate(text)} />
      <MessageMenuSheet
        message={menuFor}
        authorName={thread.name}
        onClose={() => setMenuFor(null)}
        onCopy={
          canCopyText()
            ? (m) => {
                setMenuFor(null);
                void copyText(m.text).then(() => setCopied(true));
              }
            : undefined
        }
        onReport={(m) => {
          setMenuFor(null);
          report(m.id);
        }}
      />
    </View>
  );
}
