import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
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
 * they carry an icon and the words "Düz" / "Səhv".
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
  const verdict = state === 'correct' ? t('ui.correct') : state === 'wrong' ? t('ui.wrong') : null;

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
      className={cn('rounded-md', state === 'selected' && 'bg-honey-deep pb-[3px]', className)}
    >
      <View
        className={cn(
          'min-h-14 flex-row items-center gap-3 rounded-md border-2 px-3 py-2',
          box[state],
        )}
      >
        <View
          className={cn(
            'h-[30px] w-[30px] items-center justify-center rounded-xs',
            letterBox[state],
          )}
        >
          <Text className={cn('font-sans-black text-sm', letterText[state])}>{letter}</Text>
        </View>
        <View className="min-w-0 flex-1">{children}</View>
        {verdict ? (
          <View className="flex-row items-center gap-1">
            <Icon
              name={state === 'correct' ? 'check' : 'x'}
              size={16}
              color={state === 'correct' ? 'ok' : 'err'}
            />
            <Text
              className={cn(
                'font-sans-black text-xs',
                state === 'correct' ? 'text-ok' : 'text-err',
              )}
            >
              {verdict}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
