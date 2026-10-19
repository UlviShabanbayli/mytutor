import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { OptionKey, PracticeTest, Question } from '@mytutor/types';
import { Button, IconButton } from '@/components/ui';
import { isCorrect } from '@/features/tests/answers';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { TestMathContext } from '@/features/tests/testMath';
import { fontSize } from '@/theme';
import { FeedbackPanel } from './FeedbackPanel';
import { MathText } from './MathText';
import { OpenAnswerInput } from './OpenAnswerInput';
import { OptionButton, type OptionState } from './OptionButton';
import { QuestionFigure } from './QuestionFigure';
import { SessionProgress } from './SessionProgress';

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

type TestSessionProps = {
  test: PracticeTest;
};

/**
 * One question at a time: pick an option (or type the number) → check → feedback with the
 * right answer and the source → next.
 */
export function TestSession({ test }: TestSessionProps) {
  const { t } = useTranslation();
  const { session, start, select, check, next, finish } = useTestSessionStore();

  useEffect(() => start(test.id), [start, test.id]);

  const active = session?.testId === test.id ? session : null;
  const question = active ? test.questions[active.index] : undefined;
  if (!active || !question) return null;

  const selected = active.answers[question.id];
  const answered = Boolean(selected?.trim());
  const isLast = active.index === test.questions.length - 1;
  const correct = isCorrect(question, selected);

  const onCheck = () => {
    check();
    void Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
  };

  const onContinue = () => {
    if (!isLast) return next();
    finish(test);
    router.replace({ pathname: '/test/[id]/result', params: { id: test.id } });
  };

  return (
    // The feedback panel runs to the bottom edge and pads for the home indicator itself.
    <SafeAreaView
      edges={active.checked ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
      className="flex-1 bg-background"
    >
      <View className="flex-row items-center gap-2 pb-1 pl-2 pr-5">
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={router.back} />
        <SessionProgress title={test.title} index={active.index} total={test.questions.length} />
      </View>
      <TestMathContext.Provider value={test.math}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-5 px-5 py-5">
          <MathText
            text={question.stem}
            fontSize={fontSize.lg[0]}
            className="font-sans-bold text-lg"
          />
          {question.figures.map((figure) => (
            <QuestionFigure key={figure} path={figure} />
          ))}
          {question.type === 'open' ? (
            <OpenAnswerInput
              value={selected ?? ''}
              disabled={active.checked}
              onChange={(value) => select(question.id, value)}
              onSubmit={() => {
                if (answered && !active.checked) onCheck();
              }}
            />
          ) : (
            <View accessibilityRole="radiogroup" className="gap-2.5">
              {question.options.map((option) => (
                <OptionButton
                  key={option.key}
                  option={option}
                  state={optionState(question, option.key, selected, active.checked)}
                  disabled={active.checked}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    select(question.id, option.key);
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </TestMathContext.Provider>
      {active.checked ? (
        <FeedbackPanel
          question={question}
          correct={correct}
          isLast={isLast}
          onContinue={onContinue}
        />
      ) : (
        <View className="px-5 pb-2 pt-3">
          <Button label={t('session.check')} disabled={!answered} onPress={onCheck} />
        </View>
      )}
    </SafeAreaView>
  );
}
