import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Icon,
  Screen,
  ScreenHeader,
  Sheet,
  SourceLine,
  StatusPill,
  Text,
} from '@/components/ui';
import { daysAgo, formatClock, shortWhen } from '@/features/ask/dates';
import { useAskStore } from '@/features/ask/store';
import type { AskQuestion } from '@/features/ask/types';
import { HelpfulFooter } from './HelpfulFooter';
import { PhotoThumb } from './PhotoThumb';
import { RelatedTopicCard } from './RelatedTopicCard';
import { ReportSheet } from './ReportSheet';
import { SimilarQuestions } from './SimilarQuestions';
import { SolutionStepList } from './SolutionStepList';

type AskAnswerViewProps = {
  question: AskQuestion;
  answer: NonNullable<AskQuestion['answer']>;
};

/** The teacher-approved answer: steps, what the teacher changed, source, topic, similar ones. */
export function AskAnswerView({ question, answer }: AskAnswerViewProps) {
  const { t } = useTranslation();
  const feedback = useAskStore((s) => s.feedback[question.id]);
  const setFeedback = useAskStore((s) => s.setFeedback);
  const reported = useAskStore((s) => s.reportedIds.includes(question.id));
  const report = useAskStore((s) => s.report);
  const [reporting, setReporting] = useState(false);
  const [photo, setPhoto] = useState(false);
  const now = new Date();
  const thumb = <PhotoThumb uri={question.photoUri} mark={question.mark} size="md" />;

  return (
    <Screen scroll={false} className="gap-0 px-0 py-0">
      <View className="px-4 pt-4">
        <ScreenHeader
          title={t('ask.answer.title')}
          actions={
            <Button
              label={t('ask.answer.report')}
              variant="text"
              size="md"
              icon="report"
              onPress={() => setReporting(true)}
            />
          }
        />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="gap-3 px-4 pb-4 pt-1">
        <View className="flex-row items-start gap-3">
          {question.photoUri ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('ask.answer.enlarge')}
              onPress={() => setPhoto(true)}
            >
              {thumb}
            </Pressable>
          ) : (
            thumb
          )}
          <View className="min-w-0 flex-1 gap-1.5">
            <StatusPill
              kind="teacher"
              label={t('ask.answer.approvedBy', { teacher: answer.teacherName })}
            />
            <Text className="font-sans-black leading-5">{question.title}</Text>
            {question.answeredAt ? (
              <Text variant="caption" tone="muted" className="font-sans text-xs">
                {t('ask.answer.times', {
                  sent: shortWhen(t, new Date(question.sentAt), now),
                  // Answered the same day: the date once is enough.
                  ready:
                    daysAgo(new Date(question.sentAt), new Date(question.answeredAt)) === 0
                      ? formatClock(new Date(question.answeredAt))
                      : shortWhen(t, new Date(question.answeredAt), now),
                })}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="gap-2.5 rounded-xl border border-border bg-surf p-3.5">
          <Text variant="subheading">{t('ask.answer.steps')}</Text>
          <SolutionStepList steps={answer.steps} highlightAnswer />
          {answer.teacherNote ? (
            <View className="flex-row items-start gap-2">
              <Icon name="edit" size={16} color="ok" />
              <Text variant="caption" tone="ok" className="flex-1 font-sans-bold">
                {t('ask.answer.teacherNote', {
                  teacher: answer.teacherName,
                  note: answer.teacherNote,
                })}
              </Text>
            </View>
          ) : null}
          {question.source ? <SourceLine source={question.source} /> : null}
        </View>

        {question.topic ? <RelatedTopicCard topic={question.topic} /> : null}
        <SimilarQuestions items={question.similar} />
      </ScrollView>
      <HelpfulFooter value={feedback} onChange={(v) => setFeedback(question.id, v)} />
      <ReportSheet
        visible={reporting}
        onClose={() => setReporting(false)}
        done={reported}
        onReport={() => report(question.id)}
      />
      {question.photoUri ? (
        <Sheet visible={photo} onClose={() => setPhoto(false)} title={t('ask.answer.photo')}>
          <Image
            source={{ uri: question.photoUri }}
            resizeMode="contain"
            className="h-[420px] w-full rounded-lg bg-cap"
          />
        </Sheet>
      ) : null}
    </Screen>
  );
}
