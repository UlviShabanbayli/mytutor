import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon, IconButton, Text } from '@/components/ui';
import { hiveCounts } from '@/features/learn/mastery';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type HiveHeaderProps = {
  /** Null while the hive loads (skeletons in place of the count). */
  hive: Hive | null;
  saved: boolean;
  onDownload: () => void;
};

/** Back, "PƏTƏK QUTUSU · 7-Cİ SİNİF", the name, download; then the textbook chip and count. */
export function HiveHeader({ hive, saved, onDownload }: HiveHeaderProps) {
  const { t, grade, bookName, part, hiveName } = useLearnText();
  const counts = hive ? hiveCounts(hive) : null;

  return (
    <View className="gap-2 pb-1">
      <View className="flex-row items-center gap-1 pr-3">
        <IconButton icon="back" accessibilityLabel={t('learn.hive.back')} onPress={router.back} />
        {hive ? (
          <View className="min-w-0 flex-1 gap-px">
            <Text variant="overline" tone="muted">
              {t('learn.hive.overline', { grade: grade(hive.grade) })}
            </Text>
            <Text variant="heading" className="font-display-black text-xl" numberOfLines={1}>
              {hiveName(hive)}
            </Text>
          </View>
        ) : (
          <View className="flex-1 gap-2">
            <View className="h-[11px] w-32 rounded-full bg-wax" />
            <View className="h-[22px] w-44 rounded-full bg-wax" />
          </View>
        )}
        {hive ? (
          <IconButton
            icon={saved ? 'check' : 'download'}
            variant="outlined"
            accessibilityLabel={t(saved ? 'learn.hive.downloaded' : 'learn.hive.download')}
            onPress={onDownload}
          />
        ) : null}
      </View>
      <View className="flex-row items-center gap-2.5 px-4">
        {hive ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('learn.hive.textbookAria', {
              book: bookName(hive),
              part: part(hive.part),
            })}
            onPress={() =>
              router.push({ pathname: '/learn/textbook', params: { hiveId: hive.id } })
            }
            className="h-[44px] flex-row items-center gap-1.5 rounded-md border border-border bg-raised pl-2.5 pr-3 active:opacity-80"
          >
            <Icon name="book" size={18} color="honey-text" />
            <Text className="font-sans-black text-sm">
              {t('learn.hive.textbookChip', { book: bookName(hive), part: part(hive.part) })}
            </Text>
            <Icon name="down" size={16} color="muted" />
          </Pressable>
        ) : (
          <View className="h-[44px] w-40 rounded-md bg-wax" />
        )}
        <View className="flex-1" />
        {counts ? (
          <View
            accessible
            accessibilityLabel={t('learn.hive.countAria', counts)}
            className="flex-row items-baseline gap-1"
          >
            <Text className="font-display-black text-lg">{counts.filled}</Text>
            <Text className="font-sans-bold text-sm" tone="muted">
              / {counts.total}
            </Text>
          </View>
        ) : (
          <View className="h-[18px] w-[54px] rounded-full bg-wax" />
        )}
      </View>
    </View>
  );
}
