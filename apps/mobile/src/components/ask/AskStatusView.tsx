import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, IconButton, Screen, ScreenHeader, SuccessCheck, Text } from '@/components/ui';
import { useAskStore } from '@/features/ask/store';
import type { AskQuestion } from '@/features/ask/types';
import { AiDraftCard } from './AiDraftCard';
import { PhotoThumb } from './PhotoThumb';
import { QuestionMenuSheet } from './QuestionMenuSheet';
import { StatusTimeline } from './StatusTimeline';

type AskStatusViewProps = {
  question: AskQuestion;
  /** Opened right after sending: a drawn check confirms it first (micro.done A). */
  justSent?: boolean;
};

/** A question on its way: the four steps, the AI's first solution (marked as AI), a lesson. */
export function AskStatusView({ question, justSent = false }: AskStatusViewProps) {
  const { t } = useTranslation();
  const cancel = useAskStore((s) => s.cancel);
  const report = useAskStore((s) => s.report);
  const reported = useAskStore((s) => s.reportedIds.includes(question.id));
  const [menu, setMenu] = useState(false);
  const queue =
    question.queue === 'teacher' && question.teacherName
      ? t('ask.status.queueTeacher', { teacher: question.teacherName })
      : t('ask.status.queueGeneral');

  return (
    <Screen className="gap-3">
      <ScreenHeader
        title={t('ask.status.title')}
        actions={
          <IconButton
            icon="more"
            accessibilityLabel={t('ask.status.more')}
            onPress={() => setMenu(true)}
          />
        }
      />
      {justSent ? (
        <SuccessCheck
          title={t(question.status === 'queued' ? 'ask.status.savedTitle' : 'ask.status.sentTitle')}
          body={t(question.status === 'queued' ? 'ask.status.savedBody' : 'ask.status.sentBody')}
          className="rounded-xl border border-border bg-surf px-4 py-5"
        />
      ) : null}
      <View className="flex-row items-center gap-3">
        <PhotoThumb uri={question.photoUri} mark={question.mark} size="md" />
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-sans-black leading-5">{question.title}</Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {t('ask.status.meta', { subject: question.subjectLabel, queue })}
          </Text>
        </View>
      </View>
      <StatusTimeline question={question} />
      <AiDraftCard question={question} />
      {question.topic ? (
        <View className="flex-row items-center gap-2.5">
          <Mascot mood="dusunur" size={56} decorative />
          <Text variant="caption" tone="muted" className="flex-1 font-sans">
            {t('ask.status.waitLesson', { topic: question.topic.number })}
          </Text>
          <Button
            label={t('ask.status.watchLesson')}
            variant="text"
            size="md"
            icon="play"
            onPress={() =>
              question.topic &&
              router.push({ pathname: '/lesson/[id]', params: { id: question.topic.lessonId } })
            }
            className="rounded-md bg-raised"
          />
        </View>
      ) : null}
      <QuestionMenuSheet
        visible={menu}
        onClose={() => setMenu(false)}
        removeLabel={t('ask.status.cancel')}
        confirm={{
          title: t('ask.status.cancelTitle'),
          body: t('ask.status.cancelBody'),
          action: t('ask.status.cancelConfirm'),
        }}
        onRemove={() => {
          setMenu(false);
          router.back();
          cancel(question.id);
        }}
        reported={reported}
        onReport={() => report(question.id)}
      />
    </Screen>
  );
}
