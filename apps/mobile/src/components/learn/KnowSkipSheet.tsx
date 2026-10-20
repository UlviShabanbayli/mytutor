import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import type { TopicPlace } from '@/features/learn/mastery';
import { openTest } from '@/features/learn/navigation';
import { useTopicTest, useUnitTest } from '@/features/learn/queries';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type KnowSkipSheetProps = {
  hive: Hive;
  place: TopicPlace;
  onClose: () => void;
};

/** Honey a skipped topic is worth (demo: the points rules come with the motivation API). */
const SKIP_POINTS = 20;

/**
 * "Bilirəm, keç" (architecture: a topic is never marked known without a short check): what a
 * pass gives, that a miss takes nothing, then the check or the whole unit's test.
 */
export function KnowSkipSheet({ hive, place, onClose }: KnowSkipSheetProps) {
  const { t, source } = useLearnText();
  const insets = useSafeAreaInsets();
  const { test } = useTopicTest(place.topic.id);
  const unitTest = useUnitTest(place.unit.id).test;
  const { topic, unit, index } = place;
  const next = unit.topics[index + 1];
  const count = test?.questionCount ?? 0;
  const go = (id: string) => {
    onClose();
    openTest(id);
  };

  return (
    <View className="flex-1 justify-end">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        className="absolute inset-0 bg-scrim"
      />
      <View
        accessibilityViewIsModal
        className="gap-3 rounded-t-3xl bg-surf px-5 pt-2.5"
        // The home indicator inset is device-specific.
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="h-[5px] w-10 self-center rounded-full bg-border" />
        <View className="flex-row items-center gap-2.5">
          <Mascot moment="weakSpot" size={84} />
          <View className="min-w-0 flex-1 gap-1">
            <Text variant="overline" className="text-xs text-honey-text">
              {test
                ? t('learn.know.overline', { minutes: Math.max(1, Math.round(count * 0.6)) })
                : t('learn.know.overlineShort')}
            </Text>
            <Text variant="heading" className="font-display-black">
              {test ? t('learn.know.title', { count }) : t('learn.know.titleWaiting')}
            </Text>
            <Text className="text-sm" tone="muted">
              {t('learn.know.topic', { number: topic.number, title: topic.title })}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2.5 rounded-lg bg-ok-bg px-3 py-2.5">
          <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-ok">
            <Icon name="check" size={16} color="surf" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans-black text-base text-ok">{t('learn.know.passTitle')}</Text>
            <Text className="text-sm">
              {next
                ? t('learn.know.pass', {
                    number: topic.number,
                    points: SKIP_POINTS,
                    next: next.number,
                  })
                : t('learn.know.passLast', { number: topic.number, points: SKIP_POINTS })}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2.5 rounded-lg bg-raised px-3 py-2.5">
          <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-surf">
            <Icon name="shield" size={16} color="honey-text" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans-black text-base">{t('learn.know.failTitle')}</Text>
            <Text className="text-sm">{t('learn.know.fail')}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon name="book" size={16} color="muted" />
          <Text className="flex-1 text-xs" tone="muted">
            {t('learn.know.source', { source: source(hive, topic, false) })}
          </Text>
        </View>
        <Button
          label={test ? t('learn.know.start') : t('learn.know.notReady')}
          disabled={!test}
          onPress={() => test && go(test.id)}
        />
        {unitTest ? (
          <Button
            variant="secondary"
            size="md"
            label={t('learn.know.wholeUnit', { count: unitTest.questionCount })}
            onPress={() => go(unitTest.id)}
          />
        ) : null}
      </View>
    </View>
  );
}
