import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, SourceLine, Text } from '@/components/ui';
import { prettyExpression, sameExpression } from '@/features/study/expression';
import type { StudyLesson } from '@/features/study/types';
import { playCue } from '@/lib/cues';
import { AskViziChip } from './AskViziChip';
import { ExerciseSheet, type ExerciseOutcome } from './ExerciseSheet';
import { ExpressionField } from './ExpressionField';
import { Kicker } from './Kicker';
import { MathKeypad } from './MathKeypad';
import { StepLayout } from './StepLayout';

type LessonExerciseStepProps = {
  lesson: StudyLesson;
  onSeeRule: () => void;
  onNext: () => void;
};

/** Step 4: the student expands the expression; the answer is checked against the book's. */
export function LessonExerciseStep({ lesson, onSeeRule, onNext }: LessonExerciseStepProps) {
  const { t } = useTranslation();
  const { exercise } = lesson;
  const [value, setValue] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [outcome, setOutcome] = useState<ExerciseOutcome | null>(null);

  const insert = (text: string) => {
    const next = value.slice(0, selection.start) + text + value.slice(selection.end);
    const caret = selection.start + text.length;
    setValue(next);
    setSelection({ start: caret, end: caret });
  };
  // "a^2 - b" turns into "a² − b" as it is typed; the caret follows a shortened text.
  const type = (text: string) => {
    const pretty = prettyExpression(text);
    setValue(pretty);
    if (pretty.length !== text.length) setSelection({ start: pretty.length, end: pretty.length });
  };
  const check = () => {
    const same = sameExpression(value, exercise.answer);
    playCue(same ? 'correct' : 'wrong');
    setOutcome(same ? 'same' : 'different');
  };

  return (
    <StepLayout
      sheet={
        outcome ? (
          <ExerciseSheet
            exercise={exercise}
            outcome={outcome}
            onRetry={() => setOutcome(null)}
            onContinue={onNext}
          />
        ) : undefined
      }
      footer={
        <View className="gap-1">
          <Button label={t('study.common.check')} disabled={!value.trim()} onPress={check} />
          <Button
            label={t('study.lesson.showAnswer')}
            variant="text"
            icon="book"
            onPress={() => setOutcome('shown')}
          />
        </View>
      }
    >
      <Kicker>{t('study.lesson.exerciseKicker', { n: exercise.number })}</Kicker>
      <View className="gap-2 rounded-xl border border-border bg-surf p-3.5">
        <Text className="font-sans-semibold">{exercise.prompt}</Text>
        <Text className="font-sans-bold text-2xl">{exercise.expression}</Text>
        <SourceLine source={exercise.source} />
      </View>
      <ExpressionField
        value={value}
        selection={selection}
        correct={outcome === 'same'}
        editable={outcome === null}
        onChange={type}
        onSelectionChange={setSelection}
      />
      {outcome === null ? (
        <>
          <MathKeypad variables={exercise.variables} onKey={insert} />
          <View className="flex-row flex-wrap gap-2 pt-1">
            <AskViziChip label={t('study.lesson.seeRule')} icon="star" onPress={onSeeRule} />
            <AskViziChip label={t('study.lesson.hint')} onPress={() => router.push('/chat')} />
          </View>
          <Text variant="caption" tone="muted">
            {t('study.lesson.noLoss')}
          </Text>
        </>
      ) : null}
    </StepLayout>
  );
}
