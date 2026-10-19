import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestionMenuSheet } from '@/components/ask/QuestionMenuSheet';
import { ChatHeader } from '@/components/ask/chat/ChatHeader';
import { ChatInputBar } from '@/components/ask/chat/ChatInputBar';
import { ChatThread } from '@/components/ask/chat/ChatThread';
import { CURRENT_TOPIC } from '@/features/ask/demo';
import { chatMood } from '@/features/ask/chatScript';
import { pickFromGallery } from '@/features/ask/photo';
import { useAskStore } from '@/features/ask/store';
import type { ChatOrigin } from '@/features/ask/types';
import { useViziChat } from '@/features/ask/useViziChat';

const ORIGINS: ChatOrigin[] = ['lesson', 'test', 'topic', 'ask'];

/**
 * Vızıdan soruş. Opened from a lesson, test or topic with `?from=lesson&q=…` the question is
 * asked at once ("İzah et"); from the Ask tab it starts with Vızı's welcome.
 */
export default function ViziChatScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ from?: string; q?: string }>();
  const origin = ORIGINS.find((o) => o === params.from) ?? 'ask';
  const chat = useViziChat();
  const setPhoto = useAskStore((s) => s.setPhoto);
  const setNote = useAskStore((s) => s.setNote);
  const [menu, setMenu] = useState(false);
  const [reported, setReported] = useState(false);
  const seed = params.q;

  useEffect(() => {
    // The question the student tapped "İzah et" on; asked once, into an empty thread.
    if (seed && chat.messages.every((m) => m.role === 'vizi' && m.kind === 'welcome'))
      chat.send(seed);
    // Only on opening: later renders must not ask it again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Only the last question goes to the teacher, as the note of a new photo question. */
  function handoff() {
    setNote(chat.lastQuestion);
    router.push('/ask/camera');
  }

  async function attach() {
    const photo = await pickFromGallery();
    if (!photo) return;
    setPhoto(photo);
    setNote(chat.lastQuestion);
    router.push('/ask/crop');
  }

  const mode = !chat.online
    ? 'offline'
    : chat.limitReached && !chat.thinking
      ? 'locked'
      : chat.thinking
        ? 'busy'
        : 'ready';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ChatHeader
          mood={chatMood(chat.messages, chat.thinking, chat.limitReached)}
          onMenu={() => setMenu(true)}
        />
        <ChatThread
          messages={chat.messages}
          origin={origin}
          topic={{ number: CURRENT_TOPIC.number, title: t('ask.demo.topics.cube') }}
          thinking={chat.thinking}
          canSend={chat.canSend}
          limitReached={chat.limitReached}
          usage={chat.usage}
          onSend={chat.send}
          onHandoff={handoff}
        />
        <ChatInputBar
          mode={mode}
          onSend={(text) => chat.send(text)}
          onStop={chat.stop}
          onAttach={() => void attach()}
        />
      </KeyboardAvoidingView>
      <QuestionMenuSheet
        visible={menu}
        onClose={() => setMenu(false)}
        removeLabel={t('ask.chat.clear')}
        confirm={null}
        onRemove={() => {
          chat.clear();
          setMenu(false);
        }}
        reported={reported}
        onReport={() => setReported(true)}
      />
    </SafeAreaView>
  );
}
