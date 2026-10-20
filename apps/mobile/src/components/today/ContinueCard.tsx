import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { Icon, Text, useRaisedPress } from '@/components/ui';
import type { ContinueItem } from '@/features/today/hooks';
import { cn } from '@/lib/cn';

/** Up to this many steps are drawn as segments; longer tests get one continuous bar. */
const MAX_SEGMENTS = 8;

type ContinueCardProps = {
  item: ContinueItem;
};

function StepSegments({ done, total }: { done: number; total: number }) {
  if (total > MAX_SEGMENTS) {
    return (
      <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-spot-line">
        {/* Width is data-driven, so it cannot be a static className. */}
        <View
          className="h-full rounded-full bg-honey"
          style={{ width: `${Math.round((done / Math.max(1, total)) * 100)}%` }}
        />
      </View>
    );
  }
  return (
    <View className="mt-1 flex-row gap-1">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={cn('h-1.5 flex-1 rounded-full', i < done ? 'bg-honey' : 'bg-spot-line')}
        />
      ))}
    </View>
  );
}

/**
 * "Davam et": the inverted hero card that resumes the unfinished lesson or test. The whole card
 * is one raised button that sinks onto its honey-deep edge and comes back calmly (buttons.spot A).
 */
export function ContinueCard({ item }: ContinueCardProps) {
  const { t } = useTranslation();
  const press = useRaisedPress({ calm: true, off: false });
  const title = item.code ? `${item.code} · ${item.title}` : item.title;
  const progress =
    item.kind === 'lesson'
      ? t('today.continue.lessonProgress', { done: item.done, total: item.total })
      : t('today.continue.testProgress', { done: item.done, total: item.total });
  const meta =
    item.kind === 'lesson' && item.subject && item.part
      ? t('today.continue.lessonMeta', {
          subject: item.subject,
          part: t(`today.continue.part.${item.part}`),
          progress,
        })
      : progress;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('today.continue.action', { title, progress })}
      onPress={() => router.push(item.href)}
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      className="rounded-xl pb-1"
    >
      <View className="absolute inset-x-0 bottom-0 top-1 rounded-xl bg-honey-deep" />
      <Animated.View style={press.faceStyle}>
        <View className="flex-row items-center gap-3 rounded-xl bg-spot py-3.5 pl-4 pr-3.5">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="font-sans-black text-xs uppercase tracking-[1px] text-honey">
              {t('today.continue.overline')}
            </Text>
            <Text className="font-sans-black text-md text-on-spot" numberOfLines={2}>
              {title}
            </Text>
            <Text className="text-sm text-on-spot opacity-80" numberOfLines={1}>
              {meta}
            </Text>
            <StepSegments done={item.done} total={item.total} />
          </View>
          {/* The play button is the card's visual handle; the whole card is the control. */}
          <View className="rounded-xl bg-honey-deep pb-[3px]">
            <View className="h-14 w-14 items-center justify-center rounded-xl bg-honey">
              <Icon name="play" size={24} color="on-honey" />
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
