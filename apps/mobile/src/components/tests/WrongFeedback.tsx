import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, Text } from '@/components/ui';
import type { SessionStep } from '@/features/study/types';
import { fontSize } from '@/theme';
import { AnswerCompare } from './AnswerCompare';
import { MathText } from './MathText';
import { SourceLine } from './SourceLine';

type WrongFeedbackProps = {
  step: SessionStep;
  answer: string | undefined;
  continueLabel: string;
  onContinue: () => void;
};

/** A calm wrong answer: Vızı consoles, shows the right answer, the source and what happens next. */
export function WrongFeedback({ step, answer, continueLabel, onContinue }: WrongFeedbackProps) {
  const { t } = useTranslation();
  const question = step.kind === 'question' ? step.question : null;

  return (
    <>
      <View className="flex-row items-center gap-3">
        <Mascot moment="wrong" size={56} decorative />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="heading" className="font-display-black text-lg">
            {t('study.feedback.wrongTitle')}
          </Text>
          <Text className="text-sm">{t('study.feedback.wrongBody')}</Text>
        </View>
      </View>
      <AnswerCompare step={step} answer={answer} />
      {/* Only the source's own explanation is shown; without one, Vızı can explain. */}
      {question?.explanation ? (
        <View className="gap-1">
          <Text variant="overline" tone="muted">
            {t('study.feedback.solution')}
          </Text>
          <MathText text={question.explanation} fontSize={fontSize.sm[0]} className="text-sm" />
        </View>
      ) : question ? (
        <Text variant="caption" tone="muted">
          {t('study.feedback.noExplanation')}
        </Text>
      ) : null}
      <SourceLine source={question ? question.source : step.kind === 'match' ? step.source : ''} />
      <View className="flex-row gap-2">
        <Button
          label={t('study.feedback.askVizi')}
          variant="secondary"
          icon="chat"
          onPress={() => router.push('/chat')}
          className="flex-1"
        />
        <Button label={continueLabel} onPress={onContinue} className="flex-1" />
      </View>
      {question ? (
        <View accessibilityRole="summary" className="flex-row items-center justify-center gap-1.5">
          <Icon name="list" size={16} color="muted" />
          <Text variant="caption" tone="muted" className="text-xs">
            {t('study.feedback.addedToMistakes')}
          </Text>
        </View>
      ) : null}
    </>
  );
}
