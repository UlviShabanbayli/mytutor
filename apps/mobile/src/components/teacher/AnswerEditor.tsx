import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, LoadingState, SourceLine, StatusPill, Text } from '@/components/ui';
import type { SolutionStep } from '@mytutor/types';
import { useApproveAnswer } from '@/features/teacher/mutations';
import { goBack } from '@/features/teacher/navigation';
import type { InboxQuestion, TopicView } from '@/features/teacher/types';
import { AiVisibilityNote } from './AiVisibilityNote';
import { AnswerFooter } from './AnswerFooter';
import { QuestionHeader } from './QuestionHeader';
import { SmallButton } from './SmallButton';
import { SolutionStepRow } from './SolutionStepRow';
import { TeacherScreen } from './TeacherScreen';
import { TopicLinkRow } from './TopicLinkRow';

type AnswerEditorProps = { header: ReactNode; question: InboxQuestion; topics: TopicView[] };

let stepSeq = 0;
const blankStep = (text: string): SolutionStep => ({
  id: `new-${++stepSeq}`,
  text,
  formula: '',
  edited: true,
});

/** Check the AI's solution (M6): approve it, fix steps or write it yourself; AI-marked until then. */
export function AnswerEditor({ header, question: q, topics }: AnswerEditorProps) {
  const { t } = useTranslation();
  const approve = useApproveAnswer();
  const [steps, setSteps] = useState(q.steps);
  const [topicId, setTopicId] = useState(q.topicId ?? '');
  const [editing, setEditing] = useState<string | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const solving = q.aiStatus === 'solving' && steps.length === 0;
  const done = q.approved;
  const valid = steps.length > 0 && steps.every((s) => s.formula.trim() !== '');

  const startStep = (keep: SolutionStep[]) => {
    const step = blankStep(t('teacher.answer.newStep'));
    setSteps([...keep, step]);
    setEditing(step.id);
  };
  const update = (step: SolutionStep) => {
    setSteps((list) => list.map((s) => (s.id === step.id ? step : s)));
    setEditing(null);
  };
  const submit = () => {
    if (!valid) {
      setShowEmpty(true);
      return;
    }
    const topic = topicId !== q.topicId ? (topics.find((x) => x.id === topicId) ?? null) : null;
    approve.mutate({ question: q, steps, topic }, { onSuccess: () => goBack('/teacher/inbox') });
  };

  return (
    <TeacherScreen
      header={header}
      contentClassName="gap-2.5"
      footer={
        <AnswerFooter
          done={done}
          canFix={steps.length > 0}
          solving={solving}
          approving={approve.isPending}
          onFix={() => setEditing(steps[0]?.id ?? null)}
          onRewrite={() => startStep([])}
          onApprove={submit}
        />
      }
    >
      <QuestionHeader question={q} />
      <View className="flex-row flex-wrap items-center gap-2">
        {done ? (
          <StatusPill kind="teacher" label={t('teacher.inbox.approved')} />
        ) : (
          <StatusPill kind="ai" label={t('teacher.answer.aiPill')} />
        )}
        {done || solving ? null : (
          <Text variant="caption" tone="muted">
            {t('teacher.answer.steps', { count: steps.length })}
          </Text>
        )}
      </View>
      {solving ? <LoadingState message={t('teacher.answer.solvingTitle')} /> : null}
      {solving ? (
        <Text tone="muted" className="text-center">
          {t('teacher.answer.solvingBody')}
        </Text>
      ) : null}
      {steps.map((s, i) => (
        <SolutionStepRow
          key={s.id}
          step={s}
          index={i}
          locked={done}
          editing={editing === s.id}
          onEdit={() => setEditing(s.id)}
          onSave={update}
          onRemove={() => setSteps((list) => list.filter((x) => x.id !== s.id))}
        />
      ))}
      {done ? null : (
        <SmallButton
          variant="dashed"
          icon="plus"
          label={t('teacher.answer.addStep')}
          onPress={() => startStep(steps)}
          className="self-stretch"
        />
      )}
      {showEmpty && !valid ? (
        <Banner kind="error" message={t('teacher.answer.emptySteps')} />
      ) : null}
      {q.source ? <SourceLine source={q.source} /> : null}
      <TopicLinkRow topics={topics} value={topicId} onChange={setTopicId} locked={done} />
      {done ? (
        <Text tone="ok" className="font-sans-bold">
          {t('teacher.answer.approvedNote')}
        </Text>
      ) : (
        <AiVisibilityNote />
      )}
    </TeacherScreen>
  );
}
