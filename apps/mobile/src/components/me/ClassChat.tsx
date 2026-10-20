import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Banner, Icon, IconButton, Text } from '@/components/ui';
import { canCopy, copyText } from '@/features/me/chat';
import { useClassMessages, useIsOnline, useSendMessage } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import type { ChatMessage, ClassSummary } from '@/features/me/types';
import { ChatBubble } from './ChatBubble';
import { ChatComposer } from './ChatComposer';
import { Hex } from './Hex';
import { InfoSheet } from './InfoSheet';
import { OptionsSheet, type SheetOption } from './OptionsSheet';
import { ReportSheet } from './ReportSheet';

type ClassChatProps = { summary: ClassSummary };

/**
 * The class chat: messages are never deleted and every one of them can be reported (P6). A sent
 * message is the demo event `message.sent`, so the teacher's chat shows it too.
 */
export function ClassChat({ summary }: ClassChatProps) {
  const { t } = useTranslation();
  const scroll = useRef<ScrollView>(null);
  const { threadId, messages, isPending, isError, refetch } = useClassMessages(summary.id);
  const online = useIsOnline();
  const send = useSendMessage();
  const reported = useMeStore((s) => s.reported);
  const report = useMeStore((s) => s.report);
  const [menuFor, setMenuFor] = useState<ChatMessage | null>(null);
  const [sheet, setSheet] = useState<'menu' | 'report' | 'info' | 'attach' | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const options: SheetOption[] = menuFor
    ? [
        {
          key: 'reply',
          icon: 'chat',
          label: t('me.chat.reply'),
          onPress: () => setReplyTo(menuFor.author),
        },
        ...(canCopy
          ? [
              {
                key: 'copy',
                icon: 'file' as const,
                label: t('me.chat.copy'),
                onPress: () => void copyText(menuFor.text),
              },
            ]
          : []),
        {
          key: 'report',
          icon: 'report',
          label: t('me.shared.report'),
          danger: true,
          onPress: () => setSheet('report'),
        },
      ]
    : [];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <View className="flex-row items-center gap-2 border-b border-border px-2 pb-1.5 pt-1">
        <IconButton icon="back" accessibilityLabel={t('common.back')} onPress={router.back} />
        <Hex width={36} fill="honey">
          <Text className="font-sans-black text-xs text-on-honey">{summary.short}</Text>
        </Hex>
        <View className="flex-1">
          <Text accessibilityRole="header" className="font-sans-black text-md">
            {t('me.chat.title', { name: summary.short })}
          </Text>
          <Text tone="muted" className="text-xs">
            {t('me.chat.members', {
              students: t('me.shared.studentsCount', { count: summary.students }),
              teacher: summary.teacher,
            })}
          </Text>
        </View>
        <IconButton
          icon="info"
          color="muted"
          accessibilityLabel={t('me.chat.about')}
          onPress={() => setSheet('info')}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scroll}
          className="flex-1"
          contentContainerClassName="gap-2.5 px-4 py-2"
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        >
          <View className="flex-row items-center gap-1.5 self-center rounded-full bg-raised px-2.5 py-[5px]">
            <Icon name="shield" size={14} color="muted" />
            <Text tone="muted" className="font-sans-bold text-xs">
              {t('me.chat.rules')}
            </Text>
          </View>
          {isPending ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel={t('me.chat.loadingOlder')}
              className="gap-1.5"
            >
              <View className="h-[30px] w-[58%] rounded-md bg-wax" />
              <View className="h-[30px] w-[40%] self-end rounded-md bg-wax opacity-70" />
              <Text tone="muted" className="self-center font-sans-bold text-xs">
                {t('me.chat.loadingOlder')}
              </Text>
            </View>
          ) : null}
          {isError ? (
            <Banner
              kind="error"
              message={t('common.errorDescription')}
              actionLabel={t('common.retry')}
              onAction={() => void refetch()}
            />
          ) : null}
          <Text variant="overline" tone="muted" className="self-center">
            {t('me.chat.today')}
          </Text>
          {!isPending && messages.length === 0 ? (
            <Text tone="muted" className="self-center py-6">
              {t('me.chat.empty')}
            </Text>
          ) : null}
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              reported={reported.includes(m.id)}
              onOpenMenu={() => {
                setMenuFor(m);
                setSheet('menu');
              }}
            />
          ))}
        </ScrollView>
        {!online ? (
          <Banner kind="offline" message={t('me.chat.offline')} className="mx-3 mb-2" />
        ) : null}
        <ChatComposer
          replyTo={replyTo}
          disabled={!online || threadId === null}
          onCancelReply={() => setReplyTo(null)}
          onAttach={() => setSheet('attach')}
          onSend={(text) => {
            if (threadId) send(threadId, text);
            setReplyTo(null);
          }}
        />
      </KeyboardAvoidingView>

      <OptionsSheet
        visible={sheet === 'menu'}
        title={t('me.chat.menuLabel')}
        options={options}
        note={t('me.chat.reportNote')}
        onClose={() => setSheet(null)}
        header={
          menuFor ? (
            <View className="rounded-[18px] rounded-tl-[4px] border-2 border-honey bg-surf px-3 py-[9px]">
              <Text className="font-sans-black text-sm">{menuFor.author}</Text>
              <Text className="leading-5">{menuFor.text}</Text>
            </View>
          ) : null
        }
      />
      <ReportSheet
        visible={sheet === 'report'}
        onClose={() => setSheet(null)}
        onReport={() => menuFor && report(menuFor.id)}
      />
      <InfoSheet
        visible={sheet === 'info'}
        title={t('me.chat.title', { name: summary.short })}
        paragraphs={[t('me.chat.infoBody1'), t('me.chat.infoBody2')]}
        onClose={() => setSheet(null)}
      />
      <InfoSheet
        visible={sheet === 'attach'}
        title={t('me.chat.attachSoonTitle')}
        paragraphs={[t('me.chat.attachSoonBody')]}
        onClose={() => setSheet(null)}
      />
    </SafeAreaView>
  );
}
