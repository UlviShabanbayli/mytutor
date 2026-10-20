import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon, Text, useRaisedPress } from '@/components/ui';
import { listJoin, numberRanges } from '@/features/learn/text';
import type { Hive, HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type FrameFooterProps = {
  hive: Hive;
  unit: HiveUnit;
  online: boolean;
};

/**
 * Under an open frame's comb: "Sən buradasan" with Davam for the current topic when online;
 * offline, which of the frame's cells are on the phone and which need the internet.
 */
export function FrameFooter({ hive, unit, online }: FrameFooterProps) {
  const press = useRaisedPress({ depth: 3 });
  const { t } = useLearnText();
  const current = unit.topics.find((topic) => topic.id === hive.currentTopicId);

  if (!online) {
    const saved = unit.topics.filter((x) => hive.savedTopicIds.includes(x.id));
    const missing = unit.topics.filter((x) => !hive.savedTopicIds.includes(x.id));
    const and = t('learn.and');
    const note =
      saved.length === 0
        ? t('learn.hive.offlineNoneSaved')
        : t('learn.hive.offlineNote', {
            saved: listJoin(numberRanges(saved.map((x) => x.number)), and),
            missing: listJoin(
              [...numberRanges(missing.map((x) => x.number)), t('learn.hive.unitTest')],
              and,
            ),
          });
    return (
      <View className="mx-2 mb-2 flex-row items-center gap-2.5 rounded-md border border-dashed border-slat-edge px-3 py-2">
        <Icon name="download" size={18} color="lock-ink" />
        <Text className="flex-1 text-sm" tone="lock">
          {note}
        </Text>
      </View>
    );
  }

  if (!current) return null;
  const go = () => router.push({ pathname: '/topic/[id]', params: { id: current.id } });

  return (
    <View className="mx-2 mb-2 flex-row items-center gap-2.5 rounded-md bg-surf py-1.5 pl-3 pr-1.5">
      <View className="min-w-0 flex-1 gap-px">
        <Text variant="overline" tone="honey">
          {t('learn.hive.hereOverline')}
        </Text>
        <Text numberOfLines={1} className="font-sans-black text-sm">
          {t('learn.hive.hereTopic', { number: current.number, title: current.title })}
        </Text>
      </View>
      <Pressable
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        accessibilityRole="button"
        accessibilityLabel={t('learn.hive.hereAria', {
          number: current.number,
          title: current.title,
        })}
        onPress={go}
        className="rounded-[12px] bg-honey-deep pb-[3px]"
      >
        <Animated.View style={press.faceStyle}>
          <View className="h-[44px] flex-row items-center gap-1.5 rounded-[12px] bg-honey px-3.5">
            <Icon name="play" size={16} color="on-honey" />
            <Text className="font-sans-black text-sm text-on-honey">
              {t('learn.hive.hereAction')}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
