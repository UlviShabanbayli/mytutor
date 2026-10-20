import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableCard, StaggerLead, StaggerText, Text } from '@/components/ui';
import { statusLabel } from '@/features/ask/labels';
import type { AskQuestion } from '@/features/ask/types';
import { PhotoThumb } from './PhotoThumb';
import { QuestionStatusPill } from './QuestionStatusPill';

type QuestionRowProps = {
  question: AskQuestion;
  /** Next to the status: time, day or subject. */
  meta: string;
  /** Muted line under the status, e.g. "Lalə müəllim yoxlayır · adətən 15 dəq". */
  note?: string;
};

/** One photo question in a list; opens its status or answer. */
export function QuestionRow({ question, meta, note }: QuestionRowProps) {
  const { t } = useTranslation();

  return (
    <PressableCard
      accessibilityLabel={t('ask.state.rowA11y', {
        title: question.title,
        status: statusLabel(t, question),
        meta: note ? `${meta}. ${note}` : meta,
      })}
      onPress={() => router.push({ pathname: '/ask/[id]', params: { id: question.id } })}
      className="rounded-lg"
      contentClassName="min-h-[70px] flex-row items-center gap-3 rounded-lg px-3 py-2"
    >
      <StaggerLead>
        <PhotoThumb uri={question.photoUri} mark={question.mark} />
      </StaggerLead>
      <StaggerText className="gap-1.5">
        <Text className="font-sans-black leading-5">{question.title}</Text>
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <QuestionStatusPill status={question.status} />
          <Text variant="caption" tone="muted" className="text-xs">
            {meta}
          </Text>
        </View>
        {note ? (
          <Text variant="caption" tone="muted" className="font-sans">
            {note}
          </Text>
        ) : null}
      </StaggerText>
    </PressableCard>
  );
}
