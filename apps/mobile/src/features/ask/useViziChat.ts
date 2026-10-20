import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { buildReply, nextMessageId, welcomeReply } from './chatReplies';
import { awaitsPracticeAnswer, classifyMessage, isPracticeAnswerCorrect } from './chatScript';
import { useChatStore } from './chatStore';
import { CHAT_TOPIC } from './chatTopic';
import { useAskUsage } from './queries';
import type { ChatIntent, ChatMessage } from './types';
import { useOnline } from './useOnline';

/** How long the scripted Vızı "thinks", so the thinking state is visible (demo only). */
const THINK_MS = 1400;

/**
 * The Vızı chat until the AI chat API exists (architecture Ş9): replies are scripted
 * (`chatScript`, `chatReplies`), each student message counts against the daily limit.
 */
export function useViziChat() {
  const { t } = useTranslation();
  const messages = useChatStore((s) => s.messages);
  const thinking = useChatStore((s) => s.thinking);
  const { usage } = useAskUsage();
  const online = useOnline();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limitReached = usage !== undefined && usage.chatUsed >= usage.chatLimit;
  const canSend = online && !thinking && !limitReached;

  // An empty thread opens with Vızı's welcome; it is not stored, so clearing brings it back.
  const shown: ChatMessage[] =
    messages.length > 0 ? messages : [welcomeReply(t, CHAT_TOPIC.number)];

  function send(text: string, intent?: ChatIntent) {
    const trimmed = text.trim();
    if (!canSend || trimmed.length === 0) return;
    const store = useChatStore.getState();
    const resolved = intent ?? classifyMessage(trimmed, awaitsPracticeAnswer(store.messages));
    const correct = resolved === 'practiceAnswer' && isPracticeAnswerCorrect(trimmed);

    store.add({ id: nextMessageId(), role: 'student', text: trimmed });
    store.countMessage();
    store.setThinking(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      const latest = useChatStore.getState();
      if (!latest.thinking) return;
      latest.add(buildReply(t, resolved, correct));
      latest.setThinking(false);
    }, THINK_MS);
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    useChatStore.getState().setThinking(false);
  }

  function clear() {
    stop();
    useChatStore.getState().clear();
  }

  /** The student's last question: the only part of the chat that goes to a teacher. */
  const lastQuestion = [...messages].reverse().find((m) => m.role === 'student');

  return {
    messages: shown,
    thinking,
    online,
    limitReached,
    canSend,
    usage,
    lastQuestion: lastQuestion?.role === 'student' ? lastQuestion.text : '',
    send,
    stop,
    clear,
  };
}
