import { ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, StatusPill, Text } from '@/components/ui';
import { POINTS_PER_CORRECT } from '@/features/study/rewards';
import type { SessionStep, StepVerdict } from '@/features/study/types';
import { cn } from '@/lib/cn';
import { duration } from '@/theme';
import { WrongFeedback } from './WrongFeedback';

type FeedbackPanelProps = {
  step: SessionStep;
  answer: string | undefined;
  verdict: StepVerdict;
  isLast: boolean;
  onContinue: () => void;
};

const boxes: Record<StepVerdict, string> = {
  correct: 'bg-ok-bg',
  wrong: 'bg-err-bg',
  pending: 'bg-info-bg',
};

/** The sheet after "Yoxla": right (+10 bal), wrong (calm, with the right answer) or sent. */
export function FeedbackPanel({ step, answer, verdict, isLast, onContinue }: FeedbackPanelProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const continueLabel = isLast ? t('study.test.finish') : t('study.common.continue');
  const sent = verdict === 'pending';

  return (
    // Reanimated layout animations respect the system reduce-motion setting by default.
    <Animated.View entering={FadeInDown.duration(duration.normal)}>
      <View
        accessibilityLiveRegion="polite"
        className={cn('rounded-t-3xl', boxes[verdict])}
        // A long explanation scrolls inside the sheet; the sheet never covers the whole screen.
        style={{ maxHeight: height * 0.75 }}
      >
        <ScrollView
          bounces={false}
          contentContainerClassName="gap-3 px-4 pt-4"
          // The sheet runs under the home indicator; its content stays above it.
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
        >
          {verdict === 'wrong' ? (
            <WrongFeedback
              step={step}
              answer={answer}
              continueLabel={continueLabel}
              onContinue={onContinue}
            />
          ) : (
            <>
              <View className="flex-row items-center gap-3">
                <View
                  className={cn(
                    'h-12 w-12 items-center justify-center rounded-full',
                    sent ? 'bg-info' : 'bg-ok',
                  )}
                >
                  <Icon
                    name={sent ? 'send' : 'check'}
                    size={26}
                    color={sent ? 'info-bg' : 'ok-bg'}
                  />
                </View>
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
                  <StatusPill
                    kind="points"
                    label={t('study.common.points', { count: POINTS_PER_CORRECT })}
                  />
                )}
              </View>
              <Button label={continueLabel} onPress={onContinue} />
            </>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
}
