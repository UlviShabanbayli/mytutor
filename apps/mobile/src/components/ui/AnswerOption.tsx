import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AnswerVerdict } from '@/components/feedback/AnswerVerdict';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { useAnswerMotion, useShownAnswer } from './answerMotion';
import { Text } from './Text';

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'disabled';

type AnswerOptionProps = {
  /** "A"–"E". */
  letter: string;
  /** The option's content: text or text with formula images. */
  children: ReactNode;
  state?: AnswerState;
  onPress?: () => void;
  /** Spoken name of the option (formulas need their spoken form). */
  accessibilityLabel: string;
  className?: string;
};

const box: Record<AnswerState, string> = {
  idle: 'border-border bg-surf',
  selected: 'border-honey bg-raised',
  correct: 'border-ok bg-ok-bg',
  wrong: 'border-err bg-err-bg',
  disabled: 'border-border bg-wax',
};

const letterBox: Record<AnswerState, string> = {
  idle: 'bg-raised',
  selected: 'bg-honey',
  correct: 'bg-ok',
  wrong: 'bg-err',
  disabled: 'bg-surf',
};

const letterText: Record<AnswerState, string> = {
  idle: 'text-muted',
  selected: 'text-on-honey',
  correct: 'text-page',
  wrong: 'text-page',
  disabled: 'text-lock-ink',
};

/**
 * One A–E answer: 56pt, 14pt corners, 2pt border. Correct and wrong are never color alone:
 * they carry an icon and the words "Düz" / "Səhv". Motion: feedback.select B (the chosen option
 * lifts onto its honey-deep edge), feedback.correct B and the calm feedback.wrong C marks.
 */
export function AnswerOption({
  letter,
  children,
  state = 'idle',
  onPress,
  accessibilityLabel,
  className,
}: AnswerOptionProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const shown = useShownAnswer(state, reduced);
  const { faceStyle, edgeStyle, letterStyle } = useAnswerMotion(shown, reduced);
  // A verdict that appears after mount (on "Yoxla") animates in; one shown from the start does not.
  const [markedAtMount] = useState(state === 'correct' || state === 'wrong');
  const verdict = state === 'correct' ? t('ui.correct') : state === 'wrong' ? t('ui.wrong') : null;
  const shownVerdict = shown === 'correct' || shown === 'wrong' ? shown : null;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={verdict ? `${accessibilityLabel}, ${verdict}` : accessibilityLabel}
      accessibilityState={{
        checked: state === 'selected' || state === 'correct' || state === 'wrong',
        disabled: state === 'disabled' || onPress === undefined,
      }}
      disabled={state === 'disabled' || onPress === undefined}
      onPress={onPress}
      // The 3pt under the face is the honey-deep edge of the chosen option; it is always
      // reserved so choosing never moves the options below.
      className={cn('rounded-md pb-[3px]', className)}
    >
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 top-[3px]">
        <Animated.View style={edgeStyle}>
          <View className="flex-1 rounded-md bg-honey-deep" />
        </Animated.View>
      </View>
      <Animated.View style={faceStyle}>
        <View
          className={cn(
            'min-h-14 flex-row items-center gap-3 rounded-md border-2 px-3 py-2',
            box[shown],
          )}
        >
          <Animated.View style={letterStyle}>
            <View
              className={cn(
                'h-[30px] w-[30px] items-center justify-center rounded-xs',
                letterBox[shown],
              )}
            >
              <Text className={cn('font-sans-black text-sm', letterText[shown])}>{letter}</Text>
            </View>
          </Animated.View>
          <View className="min-w-0 flex-1">{children}</View>
          {shownVerdict ? (
            <AnswerVerdict
              key={shownVerdict}
              verdict={shownVerdict}
              label={shownVerdict === 'correct' ? t('ui.correct') : t('ui.wrong')}
              animate={!markedAtMount}
            />
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}
