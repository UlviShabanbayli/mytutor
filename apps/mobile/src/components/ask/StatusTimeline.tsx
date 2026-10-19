import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Text } from '@/components/ui';
import { formatClock } from '@/features/ask/dates';
import { ANSWER_MINUTES } from '@/features/ask/demo';
import { timelineSteps, type TimelineStep } from '@/features/ask/questions';
import type { AskQuestion } from '@/features/ask/types';
import { cn } from '@/lib/cn';
import { HexBadge } from './HexBadge';

type StatusTimelineProps = {
  question: AskQuestion;
};

type StepText = { label: string; hint: string };

function useStepText(question: AskQuestion) {
  const { t } = useTranslation();
  const clock = (iso: string | null) => (iso ? formatClock(new Date(iso)) : '');

  return (step: TimelineStep): StepText => {
    switch (step.key) {
      case 'sent':
        return step.state === 'current'
          ? { label: t('ask.status.queued'), hint: t('ask.status.queuedHint') }
          : { label: t('ask.status.sent'), hint: clock(question.sentAt) };
      case 'ai':
        if (step.state === 'done')
          return {
            label: t('ask.status.aiSolved'),
            hint: t('ask.status.aiSolvedHint', { time: clock(question.aiSolvedAt) }),
          };
        return {
          label: t('ask.status.aiSolving'),
          hint: step.state === 'current' ? t('ask.status.aiSolvingHint') : '',
        };
      case 'teacher':
        return {
          label: t('ask.status.checking'),
          hint:
            step.state !== 'current'
              ? ''
              : question.queue === 'teacher' && question.teacherName
                ? t('ask.status.checkingHint', {
                    teacher: question.teacherName,
                    minutes: ANSWER_MINUTES.teacher,
                  })
                : t('ask.status.checkingHintGeneral', { minutes: ANSWER_MINUTES.general }),
        };
      case 'ready':
        return { label: t('ask.status.ready'), hint: t('ask.status.readyHint') };
    }
  };
}

/** Göndərildi → AI həll etdi → Müəllim yoxlayır → Hazırdır, as honey cells on a line. */
export function StatusTimeline({ question }: StatusTimelineProps) {
  const { t } = useTranslation();
  const textOf = useStepText(question);
  const steps = timelineSteps(question);
  const stateWord = { done: 'stepDone', current: 'stepCurrent', todo: 'stepTodo' } as const;

  return (
    <View
      accessibilityLabel={t('ask.status.timeline')}
      className="rounded-xl border border-border bg-surf px-4 pb-1.5 pt-3.5"
    >
      {steps.map((step, i) => {
        const { label, hint } = textOf(step);
        const last = i === steps.length - 1;
        return (
          <View
            key={step.key}
            accessible
            accessibilityLabel={t('ask.status.stepA11y', {
              n: i + 1,
              label,
              state: t(`ask.status.${stateWord[step.state]}`),
              hint,
            })}
            className="min-h-[46px] flex-row gap-3"
          >
            <View className="w-[30px] items-center">
              {step.state === 'done' ? (
                <HexBadge size={28} icon="check" iconSize={15} />
              ) : step.state === 'current' ? (
                <HexBadge
                  size={28}
                  fill="nectar"
                  icon="clock"
                  iconColor="on-nectar"
                  iconSize={15}
                />
              ) : (
                <HexBadge size={28} fill="wax">
                  <Text className="font-sans-black text-xs text-lock-ink">{i + 1}</Text>
                </HexBadge>
              )}
              {last ? null : (
                <View
                  className={cn(
                    'my-0.5 w-[3px] flex-1 rounded-full',
                    step.state === 'done' ? 'bg-honey' : 'bg-wax',
                  )}
                />
              )}
            </View>
            <View className="min-w-0 flex-1 gap-px pb-2 pt-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className={cn('font-sans-black', step.state === 'todo' && 'text-lock-ink')}>
                  {label}
                </Text>
                {step.state === 'current' && step.key === 'teacher' ? (
                  <Badge label={t('ask.status.now')} tone="honey" />
                ) : null}
              </View>
              {hint ? (
                <Text
                  variant="caption"
                  tone={step.state === 'todo' ? 'lock' : 'muted'}
                  className="font-sans"
                >
                  {hint}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
