import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { OptionKey, PracticeTest, Question } from '@mytutor/types';
import { Badge, Button, IconButton, Text } from '@/components/ui';
import { DEMO_SOURCE } from '@/features/tests/demoData';
import { useTestSessionStore } from '@/features/tests/sessionStore';
import { FeedbackPanel } from './FeedbackPanel';
import { OptionButton, type OptionState } from './OptionButton';
import { SegmentedProgress } from './SegmentedProgress';

function optionState(
  question: Question,
  key: OptionKey,
  selected: OptionKey | undefined,
  checked: boolean,
): OptionState {
  if (!checked) return selected === key ? 'selected' : 'idle';
  if (key === question.correctKey) return 'correct';
  return selected === key ? 'incorrect' : 'dimmed';
}

type TestSessionProps = {
  test: PracticeTest;
};

/** One question at a time: pick → check → feedback with explanation and source → next. */
export function TestSession({ test }: TestSessionProps) {
  const { t } = useTranslation();
  const { session, start, select, check, next, finish } = useTestSessionStore();

  useEffect(() => start(test.id), [start, test.id]);

  const active = session?.testId === test.id ? session : null;
  const question = active ? test.questions[active.index] : undefined;
  if (!active || !question) return null;

  const selected = active.answers[question.id];
  const isLast = active.index === test.questions.length - 1;
  const correct = selected === question.correctKey;

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
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-2 pb-2">
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={router.back} />
        <SegmentedProgress
          test={test}
          answers={active.answers}
          index={active.index}
          checked={active.checked}
        />
        <View className="w-3" />
      </View>
      <ScrollView contentContainerClassName="gap-5 px-4 py-4">
        <View className="flex-row items-center gap-2">
          <Text variant="label" tone="muted">
            {t('session.progress', { current: active.index + 1, total: test.questions.length })}
          </Text>
          {question.source === DEMO_SOURCE ? <Badge label={t('demo.badge')} tone="accent" /> : null}
        </View>
        <Text variant="heading" className="text-2xl">
          {question.stem}
        </Text>
        <View accessibilityRole="radiogroup" className="gap-3">
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
      </ScrollView>
      {active.checked ? (
        <FeedbackPanel
          question={question}
          correct={correct}
          isLast={isLast}
          onContinue={onContinue}
        />
      ) : (
        <View className="border-t-2 border-border px-4 pb-2 pt-4">
          <Button label={t('session.check')} disabled={!selected} onPress={onCheck} />
        </View>
      )}
    </SafeAreaView>
  );
}
