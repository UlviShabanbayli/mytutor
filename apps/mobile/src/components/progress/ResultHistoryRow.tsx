import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Icon, Text, useRaisedPress } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';
import { formatDateTime } from '@/i18n/formatDateTime';
import { cn } from '@/lib/cn';

/** A finished test as the history lists it. */
export type HistoryEntry = {
  title: string;
  correct: number;
  total: number;
  finishedAt: string;
};

type ResultHistoryRowProps = {
  result: HistoryEntry;
  /** Opens the result (or the test); without it the row only shows the score. */
  onPress?: () => void;
};

// Score tiles by tier (design "Son nəticələr"): excellent green, good honey, practice blue.
const tierClasses = {
  excellent: { box: 'bg-ok-bg', text: 'text-ok' },
  good: { box: 'bg-raised', text: 'text-honey-text' },
  practice: { box: 'bg-info-bg', text: 'text-info' },
} as const;

/** A finished test: score tile, title, questions and date; opens its result or the test. */
export function ResultHistoryRow({ result, onPress }: ResultHistoryRowProps) {
  const press = useRaisedPress({ depth: 2 });
  const { t } = useTranslation();
  const score = percent(result.correct, result.total);
  const date = formatDateTime(t, new Date(result.finishedAt));
  const tier = tierClasses[scoreTier(score)];

  return (
    <Pressable
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={t('me.progress.historyLabel', { title: result.title, score, date })}
      disabled={!onPress}
      onPress={onPress}
      className="rounded-md bg-border pb-0.5"
    >
      <Animated.View style={press.faceStyle}>
        <View
          className={cn(
            'min-h-[54px] flex-row items-center gap-3 rounded-md border border-border bg-surf px-3 py-1.5',
          )}
        >
          <View
            className={cn('h-10 w-[52px] items-center justify-center rounded-[12px]', tier.box)}
          >
            <Text className={cn('font-display-black text-sm', tier.text)}>{`${score}%`}</Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans-bold text-sm" numberOfLines={2}>
              {result.title}
            </Text>
            <Text tone="muted" className="text-xs">
              {t('me.progress.historyMeta', {
                questions: t('common.questionsCount', { count: result.total }),
                date,
              })}
            </Text>
          </View>
          <Icon name="chevron" size={18} color="muted" />
        </View>
      </Animated.View>
    </Pressable>
  );
}
