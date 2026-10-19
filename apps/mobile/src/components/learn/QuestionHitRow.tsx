import { Pressable, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import type { QuestionHit } from '@/features/learn/search';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { Highlighted } from './Highlighted';

type QuestionHitRowProps = { hive: Hive; hit: QuestionHit; query: string; onPress: () => void };

/** A question found by search, with its source line. */
export function QuestionHitRow({ hive, hit, query, onPress }: QuestionHitRowProps) {
  const { t, source } = useLearnText();
  const where = t('ui.source', { source: source(hive, hit.topic, false) });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${hit.text}. ${where}`}
      onPress={onPress}
      className="gap-1.5 rounded-lg border border-border bg-surf px-3 py-2.5 active:opacity-80"
    >
      <Highlighted text={hit.text} query={query} className="font-sans-semibold text-base" />
      <View className="flex-row items-start gap-1.5">
        <Icon name="book" size={14} color="muted" />
        <Text className="flex-1 text-xs" tone="muted">
          {where}
        </Text>
      </View>
    </Pressable>
  );
}
