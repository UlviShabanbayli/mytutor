import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AnswerOption,
  Button,
  Icon,
  IconButton,
  ProgressBar,
  SourceLine,
  Text,
} from '@/components/ui';
import { findTopic } from '@/features/learn/mastery';
import { placementRange, placementStep } from '@/features/learn/placement';
import type { Hive, PlacementAnswer, PlacementQuestion } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type PlacementQuestionViewProps = {
  hive: Hive;
  questions: PlacementQuestion[];
  answers: PlacementAnswer[];
  /** `null` is "Bilmirəm". */
  onAnswer: (question: PlacementQuestion, choice: number | null) => void;
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** One question of the adaptive check: no right/wrong shown, the next one adapts to it. */
export function PlacementQuestionView({
  hive,
  questions,
  answers,
  onAnswer,
}: PlacementQuestionViewProps) {
  const { t, source } = useLearnText();
  const [picked, setPicked] = useState<{ id: string; choice: number } | null>(null);
  const { next, unitIndex } = placementStep(hive, questions, answers);
  const range = placementRange(hive, questions);
  if (!next) return null;

  const choice = picked?.id === next.id ? picked.choice : null;
  const topic = findTopic(hive, next.topicId)?.topic;
  const n = answers.length + 1;
  const answer = (value: number | null) => {
    setPicked(null);
    onAnswer(next, value);
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <View className="flex-row items-center gap-1.5 pl-1 pr-3">
        <IconButton
          icon="close"
          color="muted"
          accessibilityLabel={t('learn.placement.stop')}
          onPress={router.back}
        />
        <View className="min-w-0 flex-1 gap-1.5">
          <View className="flex-row items-baseline justify-between gap-2">
            <Text className="font-sans-black text-base">
              {t('learn.placement.questionN', { n })}
            </Text>
            <Text className="font-sans-bold text-xs" tone="muted">
              {t('learn.placement.about', range)}
            </Text>
          </View>
          <ProgressBar
            value={answers.length / range.max}
            accessibilityLabel={t('learn.placement.progress')}
          />
        </View>
      </View>
      <View className="mx-4 mt-2.5 flex-row items-center gap-2 rounded-[12px] bg-info-bg px-3 py-2">
        <Icon name="info" size={18} color="info" />
        <Text className="flex-1 text-sm">{t('learn.placement.adaptive')}</Text>
      </View>
      <ScrollView contentContainerClassName="gap-3.5 px-4 pb-3 pt-3.5">
        <View
          accessibilityLabel={t('learn.placement.question')}
          className="gap-3 rounded-xl border border-border bg-surf p-4"
        >
          <Text variant="overline" tone="muted" className="text-xs">
            {t('learn.placement.level', {
              frame: t('learn.frame', { count: (unitIndex ?? 0) + 1, ordinal: true }),
            })}
          </Text>
          <Text className="font-sans-bold text-lg">{next.prompt}</Text>
          {topic ? <SourceLine source={source(hive, topic, false)} /> : null}
        </View>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('learn.placement.options')}
          className="gap-2"
        >
          {next.options.map((text, i) => (
            <AnswerOption
              key={text}
              letter={LETTERS[i] ?? ''}
              state={choice === i ? 'selected' : 'idle'}
              accessibilityLabel={t('learn.placement.optionAria', { letter: LETTERS[i], text })}
              onPress={() => setPicked({ id: next.id, choice: i })}
            >
              <Text className="font-sans-semibold text-md">{text}</Text>
            </AnswerOption>
          ))}
        </View>
      </ScrollView>
      <View className="gap-2 px-4 pb-4 pt-3">
        <View className="flex-row gap-2.5">
          <Button
            variant="secondary"
            label={t('learn.placement.dontKnow')}
            onPress={() => answer(null)}
            className="flex-1"
          />
          <Button
            label={t('learn.placement.submit')}
            disabled={choice === null}
            onPress={() => answer(choice)}
            className="flex-[1.4]"
          />
        </View>
        <Text className="text-center text-xs" tone="muted">
          {t('learn.placement.dontKnowNote')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
