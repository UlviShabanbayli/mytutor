import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OptionKey, Question } from '@mytutor/types';
import type { SessionStep } from '@/features/study/types';
import { playCue } from '@/lib/cues';
import { fontSize } from '@/theme';
import { MatchQuestion } from './MatchQuestion';
import { MathText } from './MathText';
import { OpenAnswerInput } from './OpenAnswerInput';
import { OptionButton, type OptionState } from './OptionButton';
import { QuestionFigure } from './QuestionFigure';
import { SourceLine } from './SourceLine';
import { WrittenAnswer } from './WrittenAnswer';

function optionState(
  question: Question,
  key: OptionKey,
  selected: string | undefined,
  checked: boolean,
): OptionState {
  if (!checked) return selected === key ? 'selected' : 'idle';
  if (key === question.correctKey) return 'correct';
  return selected === key ? 'incorrect' : 'dimmed';
}

type StepBodyProps = {
  step: SessionStep;
  answer: string | undefined;
  checked: boolean;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
};

/** The question of one step and the way to answer it: options, a number, pairs or photos. */
export function StepBody({ step, answer, checked, onAnswer, onSubmit }: StepBodyProps) {
  const { t } = useTranslation();
  const stem = step.kind === 'question' ? step.question.stem : step.prompt;

  return (
    <View className="gap-2.5">
      <MathText text={stem} fontSize={fontSize.lg[0]} className="font-sans-bold text-lg" />
      {step.kind === 'question'
        ? step.question.figures.map((figure) => <QuestionFigure key={figure} path={figure} />)
        : null}
      <SourceLine source={step.kind === 'question' ? step.question.source : step.source} />
      <View className="pt-1.5">
        {step.kind === 'match' ? (
          <MatchQuestion step={step} answer={answer} checked={checked} onChange={onAnswer} />
        ) : step.kind === 'written' ? (
          <WrittenAnswer step={step} checked={checked} onChange={onAnswer} />
        ) : step.question.type === 'open' ? (
          <OpenAnswerInput
            value={answer ?? ''}
            disabled={checked}
            onChange={onAnswer}
            onSubmit={onSubmit}
          />
        ) : (
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={t('study.test.options')}
            className="gap-2.5"
          >
            {step.question.options.map((option) => (
              <OptionButton
                key={option.key}
                option={option}
                state={optionState(step.question, option.key, answer, checked)}
                disabled={checked}
                onPress={() => {
                  playCue('tap');
                  onAnswer(option.key);
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
