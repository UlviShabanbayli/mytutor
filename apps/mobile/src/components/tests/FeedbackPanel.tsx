import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { Question } from '@mytutor/types';
import { Button, Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { duration } from '@/theme';
import { SourceLine } from './SourceLine';

type FeedbackPanelProps = {
  question: Question;
  correct: boolean;
  isLast: boolean;
  onContinue: () => void;
};

/** Bottom panel shown after "Check": verdict, explanation and the cited source. */
export function FeedbackPanel({ question, correct, isLast, onContinue }: FeedbackPanelProps) {
  const { t } = useTranslation();

  return (
    // Reanimated layout animations respect the system reduce-motion setting by default.
    // Animated.View does not take className, so styling lives on the inner View.
    <Animated.View entering={FadeInDown.duration(duration.normal)}>
      <View
        accessibilityLiveRegion="polite"
        className={cn(
          'gap-3 rounded-t-xl px-4 pb-4 pt-5',
          correct ? 'bg-success-muted' : 'bg-destructive-muted',
        )}
      >
        <View className="flex-row items-center gap-2">
          <Icon
            name={correct ? 'checkmark-circle' : 'close-circle'}
            size={28}
            color={correct ? 'success' : 'destructive'}
          />
          <Text variant="heading" tone={correct ? 'success' : 'destructive'}>
            {correct ? t('session.correctTitle') : t('session.incorrectTitle')}
          </Text>
        </View>
        {!correct ? (
          <Text variant="label" tone="destructive">
            {t('session.correctAnswer', { key: question.correctKey })}
          </Text>
        ) : null}
        <View className="gap-1">
          <Text variant="label">{t('session.explanationTitle')}</Text>
          <Text>{question.explanation}</Text>
        </View>
        <SourceLine source={question.source} />
        <Button
          label={isLast ? t('session.finish') : t('session.next')}
          variant={correct ? 'success' : 'destructive'}
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
}
