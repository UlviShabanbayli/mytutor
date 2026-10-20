import type { Ref } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RisingPanel } from '@/components/feedback/RisingPanel';
import { correctB, wrongC } from '@/components/feedback/timelines';
import { ViziPeek } from '@/components/feedback/ViziPeek';
import type { SessionStep, StepVerdict } from '@/features/study/types';
import { CorrectFeedback } from './CorrectFeedback';
import { WrongFeedback } from './WrongFeedback';

type FeedbackPanelProps = {
  step: SessionStep;
  answer: string | undefined;
  verdict: StepVerdict;
  isLast: boolean;
  onContinue: () => void;
  /** The "+10 bal" pill of a right answer, where the points' drops start. */
  pointsRef?: Ref<View>;
};

// A wrong answer gets the warm surface (feedback.wrong C), never a red one.
const tones: Record<StepVerdict, string> = {
  correct: 'bg-ok-bg',
  wrong: 'bg-raised',
  pending: 'bg-info-bg',
};

const starts: Record<StepVerdict, number> = {
  correct: correctB.panelAt,
  wrong: wrongC.panelAt,
  pending: 0,
};

/**
 * The sheet after "Yoxla": right (+10 bal, springs up), wrong (calm and warm, Vızı peeks over
 * its edge, with the right answer) or sent to the teacher.
 */
export function FeedbackPanel({
  step,
  answer,
  verdict,
  isLast,
  onContinue,
  pointsRef,
}: FeedbackPanelProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const continueLabel = isLast ? t('study.test.finish') : t('study.common.continue');
  const wrong = verdict === 'wrong';

  return (
    <RisingPanel
      at={starts[verdict]}
      springy={verdict === 'correct'}
      tone={tones[verdict]}
      // A long explanation scrolls inside the sheet; the sheet never covers the whole screen.
      maxHeight={height * 0.75}
      overlay={wrong ? <ViziPeek panelAt={wrongC.panelAt} /> : null}
    >
      <ScrollView
        accessibilityLiveRegion="polite"
        bounces={false}
        contentContainerClassName="gap-3 px-4 pt-4"
        // The sheet runs under the home indicator; its content stays above it.
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
      >
        {wrong ? (
          <WrongFeedback
            step={step}
            answer={answer}
            continueLabel={continueLabel}
            onContinue={onContinue}
          />
        ) : (
          <CorrectFeedback
            step={step}
            sent={verdict === 'pending'}
            continueLabel={continueLabel}
            onContinue={onContinue}
            pointsRef={pointsRef}
          />
        )}
      </ScrollView>
    </RisingPanel>
  );
}
