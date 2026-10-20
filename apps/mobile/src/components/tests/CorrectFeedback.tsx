import type { Ref } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DrawnMark } from '@/components/feedback/DrawnMark';
import { PopIn } from '@/components/feedback/PopIn';
import { correctB } from '@/components/feedback/timelines';
import { Button, Icon, StatusPill, Text } from '@/components/ui';
import { POINTS_PER_CORRECT } from '@/features/study/rewards';
import type { SessionStep } from '@/features/study/types';
import { useReducedMotionPref } from '@/motion';
import { cn } from '@/lib/cn';

type CorrectFeedbackProps = {
  step: SessionStep;
  /** A written solution went to the teacher instead of being right. */
  sent: boolean;
  continueLabel: string;
  onContinue: () => void;
  /** The "+10 bal" pill, where the points' drops start (feedback.points C). */
  pointsRef?: Ref<View>;
};

/**
 * The panel's content for a right answer (feedback.correct B: the badge pops from 0 with
 * overshoot while its check draws, then "+10 bal" pops 0.6 → 1) or a solution sent to the
 * teacher (calm, nothing pops).
 */
export function CorrectFeedback({
  step,
  sent,
  continueLabel,
  onContinue,
  pointsRef,
}: CorrectFeedbackProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const at = correctB.panelAt;
  const badge = (
    <View
      className={cn(
        'h-12 w-12 items-center justify-center rounded-full',
        sent ? 'bg-info' : 'bg-ok',
      )}
    >
      {sent ? (
        <Icon name="send" size={26} color="info-bg" />
      ) : (
        <DrawnMark
          kind="check"
          size={26}
          strokeWidth={2.6}
          color="ok-bg"
          delay={at + correctB.checkAt}
          reduced={reduced}
        />
      )}
    </View>
  );

  return (
    <>
      <View className="flex-row items-center gap-3">
        {sent ? badge : <PopIn delay={at + correctB.badgeAt}>{badge}</PopIn>}
        <View className="min-w-0 flex-1 gap-0.5">
          <Text
            variant="heading"
            tone={sent ? 'info' : 'ok'}
            className="font-display-black text-xl"
          >
            {sent ? t('study.feedback.sentTitle') : t('study.feedback.correctTitle')}
          </Text>
          <Text className="text-sm">
            {sent && step.kind === 'written'
              ? t('study.feedback.sentBody', { name: step.reviewer })
              : t('study.feedback.correctBody')}
          </Text>
        </View>
        {sent ? null : (
          <View ref={pointsRef} collapsable={false}>
            <PopIn delay={at + correctB.pillAt} duration={correctB.pill} from={correctB.pillFrom}>
              <StatusPill
                kind="points"
                label={t('study.common.points', { count: POINTS_PER_CORRECT })}
              />
            </PopIn>
          </View>
        )}
      </View>
      <Button label={continueLabel} onPress={onContinue} />
    </>
  );
}
