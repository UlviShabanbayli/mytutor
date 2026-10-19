import { useRef } from 'react';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FadeIn, FadeInUp, LayoutAnimationConfig } from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';
import { AnimatedView } from '@/components/ui/animated';
import type { AskUsage, ChatIntent, ChatMessage, ChatOrigin } from '@/features/ask/types';
import { duration, easing, useReducedMotionPref } from '@/motion';
import { ChatContextBar } from './ChatContextBar';
import { ChatHintActions } from './ChatHintActions';
import { ChatLimitCard } from './ChatLimitCard';
import { ChatSuggestions } from './ChatSuggestions';
import { StudentBubble } from './StudentBubble';
import { TeacherHandoffCard } from './TeacherHandoffCard';
import { TypingBubble } from './TypingBubble';
import { ViziBubble } from './ViziBubble';

type ChatThreadProps = {
  messages: ChatMessage[];
  origin: ChatOrigin;
  topic: { number: string; title: string };
  thinking: boolean;
  /** The student can write now (online, not waiting, within today's limit). */
  canSend: boolean;
  limitReached: boolean;
  usage: AskUsage | undefined;
  onSend: (text: string, intent?: ChatIntent) => void;
  onHandoff: () => void;
};

/** The conversation; what follows Vızı's last reply (actions, suggestions, a teacher) sits under it. */
export function ChatThread(props: ChatThreadProps) {
  const { t } = useTranslation();
  const scroll = useRef<ScrollView>(null);
  const last = props.messages[props.messages.length - 1];
  const followUp = last?.role === 'vizi' && !props.thinking ? last : null;
  const reduced = useReducedMotionPref();
  // micro.typing: the thinking bubble fades out in 120ms, then the answer rises in its place.
  const answerIn = reduced
    ? FadeIn.duration(duration.reduced)
    : FadeInUp.delay(duration.quick).duration(duration.base).easing(easing.enter);

  return (
    <ScrollView
      ref={scroll}
      className="flex-1"
      contentContainerClassName="gap-2.5 px-4 pb-3 pt-2"
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
    >
      <ChatContextBar topicNumber={props.topic.number} topicTitle={props.topic.title} />
      {props.origin !== 'ask' ? (
        <Text variant="overline" tone="muted" className="self-center">
          {t(`ask.chat.origin.${props.origin}`)}
        </Text>
      ) : null}
      {/* Messages already there when the chat opens do not animate; new answers do. */}
      <LayoutAnimationConfig skipEntering>
        {props.messages.map((m) =>
          m.role === 'student' ? (
            <StudentBubble key={m.id} text={m.text} />
          ) : (
            <AnimatedView key={m.id} entering={answerIn}>
              <ViziBubble message={m} />
            </AnimatedView>
          ),
        )}
        {props.thinking ? <TypingBubble /> : null}
      </LayoutAnimationConfig>
      {followUp && props.canSend && followUp.followUp === 'hintActions' ? (
        <ChatHintActions onSend={props.onSend} />
      ) : null}
      {followUp && props.canSend && followUp.followUp === 'suggestions' ? (
        <ChatSuggestions items={followUp.suggestions} onSend={(text) => props.onSend(text)} />
      ) : null}
      {followUp?.followUp === 'handoff' ? (
        <TeacherHandoffCard usage={props.usage} onSend={props.onHandoff} />
      ) : null}
      {followUp?.followUp === 'mistakesLink' ? (
        <View className="self-start">
          <Button
            label={t('ask.chat.mistakesLink')}
            variant="secondary"
            size="md"
            icon="chevron"
            onPress={() => router.push('/mistakes')}
          />
        </View>
      ) : null}
      {props.limitReached && !props.thinking && props.usage ? (
        <ChatLimitCard usage={props.usage} />
      ) : null}
    </ScrollView>
  );
}
