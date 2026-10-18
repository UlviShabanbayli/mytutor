import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, SourceLine, StatusPill, Text } from '@/components/ui';
import type { AskQuestion } from '@/features/ask/types';
import { SolutionStepList } from './SolutionStepList';

type AiDraftCardProps = {
  question: AskQuestion;
};

/**
 * The AI's first solution while a teacher checks it: always marked "AI cavabı · yoxlanır",
 * with the warning that it may be wrong. Before the draft exists it says what is happening.
 */
export function AiDraftCard({ question }: AiDraftCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const draft = question.aiDraft;

  if (!draft) {
    return (
      <View className="rounded-xl border border-dashed border-border bg-surf p-3.5">
        <Text tone="muted">
          {question.status === 'queued' ? t('ask.status.queuedCard') : t('ask.status.draftPending')}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={t('ask.status.draftA11y')}
      className="gap-2.5 rounded-xl border border-border bg-surf p-3.5"
    >
      <StatusPill kind="ai" label={t('ask.state.chipAi')} />
      <Text variant="caption" tone="muted" className="font-sans">
        {t('ask.status.draftNotice')}
      </Text>
      <View className="rounded-md bg-raised px-3 py-2.5">
        <Text className="font-sans-bold text-md">{draft.answer}</Text>
      </View>
      {open ? <SolutionStepList steps={draft.steps} /> : null}
      {question.source ? <SourceLine source={question.source} /> : null}
      <Button
        label={open ? t('ask.status.draftHide') : t('ask.status.draftSteps')}
        variant="secondary"
        size="md"
        onPress={() => setOpen((v) => !v)}
        accessibilityState={{ expanded: open }}
      />
    </View>
  );
}
