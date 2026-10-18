import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { Question } from '@mytutor/types';
import { Button, Icon, Text } from '@/components/ui';
import { rightAnswer } from '@/features/tests/answers';
import { cn } from '@/lib/cn';
import { duration } from '@/theme';
import { SourceLine } from './SourceLine';

type FeedbackPanelProps = {
  question: Question;
  correct: boolean;
  isLast: boolean;
  onContinue: () => void;
};

/** Bottom panel shown after "Check": verdict, the right answer, any explanation and the source. */
export function FeedbackPanel({ question, correct, isLast, onContinue }: FeedbackPanelProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    // Reanimated layout animations respect the system reduce-motion setting by default.
    // Animated.View does not take className, so styling lives on the inner View.
    <Animated.View entering={FadeInDown.duration(duration.normal)}>
      <View
        accessibilityLiveRegion="polite"
        className={cn(
          'gap-3 rounded-t-xl border-t-4 bg-surf px-5 pt-4 shadow-lg',
          correct ? 'border-ok' : 'border-err',
        )}
        // The sheet runs under the home indicator; its content stays above it.
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-center gap-2">
          <Icon name={correct ? 'check' : 'x'} size={26} color={correct ? 'ok' : 'err'} />
          <Text variant="heading" tone={correct ? 'ok' : 'err'}>
            {correct ? t('session.correctTitle') : t('session.incorrectTitle')}
          </Text>
        </View>
        {!correct ? (
          <Text variant="label" tone="err">
            {t('session.correctAnswer', { key: rightAnswer(question) })}
          </Text>
        ) : null}
        {/* Only the source's own explanation is shown; test books give none. */}
        {question.explanation ? (
          <View className="gap-1">
            <Text variant="label">{t('session.explanationTitle')}</Text>
            <Text>{question.explanation}</Text>
          </View>
        ) : null}
        <SourceLine source={question.source} />
        {/* Moving on after a mistake is calm (inverted card color), not another red alarm. */}
        <Button
          label={isLast ? t('session.finish') : t('session.next')}
          variant={correct ? 'primary' : 'spot'}
          onPress={onContinue}
        />
      </View>
    </Animated.View>
  );
}
