import { Pressable, View } from 'react-native';
import { Icon, ProgressBar, Text } from '@/components/ui';
import { allTopics, findTopic, hiveCounts } from '@/features/learn/mastery';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { MiniComb } from './MiniComb';
import { TopicCell } from './TopicCell';

type HiveCardProps = {
  hive: Hive;
  /** "SƏNİN SİNFİN ÜÇÜN" when this is the profile's grade, else the grade. */
  overline: string;
  onOpen: () => void;
  onContinue: (topicId: string) => void;
};

/** A ready textbook on the learn tab: its mini comb, progress and the topic to continue. */
export function HiveCard({ hive, overline, onOpen, onContinue }: HiveCardProps) {
  const { t, hiveName, bookName, part, grade } = useLearnText();
  const counts = hiveCounts(hive);
  const current = findTopic(hive, hive.currentTopicId)?.topic ?? allTopics(hive)[0];
  const name = hiveName(hive);

  return (
    // Two actions in one card (open the hive, continue the topic), so the card itself is a
    // plain surface with the raised edge of a tappable card.
    <View className="rounded-xl bg-border pb-0.5">
      <View className="gap-3 rounded-xl border border-border bg-surf p-3.5">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('learn.tab.hiveAria', {
            name,
            grade: grade(hive.grade),
            book: bookName(hive),
            ...counts,
          })}
          onPress={onOpen}
          className="gap-3 active:opacity-80"
        >
          <View className="flex-row items-center gap-3.5">
            <MiniComb hive={hive} />
            <View className="min-w-0 flex-1 gap-1">
              <Text variant="overline" tone="honey">
                {overline}
              </Text>
              <Text className="font-display-black text-lg">{name}</Text>
              <Text variant="caption" tone="muted">
                {t('learn.tab.textbookLine', { book: bookName(hive), part: part(hive.part) })}
              </Text>
            </View>
            <Icon name="chevron" size={20} color="muted" />
          </View>
          <View className="flex-row items-center gap-2.5">
            <ProgressBar
              value={counts.filled / counts.total}
              accessibilityLabel={t('learn.tab.cellsProgress', counts)}
              className="flex-1"
            />
            <Text className="font-sans-black text-sm" tone="honey">
              {t('learn.tab.cellsProgress', counts)}
            </Text>
          </View>
        </Pressable>
        {current ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('learn.hive.hereAria', {
              number: current.number,
              title: current.title,
            })}
            onPress={() => onContinue(current.id)}
            className="flex-row items-center gap-2.5 rounded-md bg-raised px-2.5 py-2 active:opacity-80"
          >
            <TopicCell level={current.level} number={current.number} size={34} numberSize="sm" />
            <View className="min-w-0 flex-1 gap-px">
              <Text variant="overline" tone="muted">
                {t('learn.tab.continue')}
              </Text>
              <Text numberOfLines={1} className="font-sans-black text-sm">
                {current.title}
              </Text>
            </View>
            <View className="rounded-[12px] bg-honey-deep pb-0.5">
              <View className="h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-honey">
                <Icon name="play" size={18} color="on-honey" />
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
