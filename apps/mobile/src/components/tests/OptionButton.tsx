import { useTranslation } from 'react-i18next';
import type { AnswerOption as Option } from '@mytutor/types';
import { AnswerOption, type AnswerState } from '@/components/ui';
import { spokenText } from '@/features/tests/testMath';
import { fontSize } from '@/theme';
import { MathText } from './MathText';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

const answerState: Record<OptionState, AnswerState> = {
  idle: 'idle',
  selected: 'selected',
  correct: 'correct',
  incorrect: 'wrong',
  dimmed: 'disabled',
};

type OptionButtonProps = {
  option: Option;
  state: OptionState;
  disabled: boolean;
  onPress: () => void;
};

/** A test option: the design's A–E answer with the option's formulas typeset in line. */
export function OptionButton({ option, state, disabled, onPress }: OptionButtonProps) {
  const { t } = useTranslation();

  return (
    <AnswerOption
      letter={option.key}
      state={answerState[state]}
      onPress={disabled ? undefined : onPress}
      accessibilityLabel={t('session.optionLabel', {
        key: option.key,
        text: spokenText(option.text),
      })}
    >
      <MathText
        text={option.text}
        fontSize={fontSize.md[0]}
        className="font-sans-semibold text-md"
      />
    </AnswerOption>
  );
}
