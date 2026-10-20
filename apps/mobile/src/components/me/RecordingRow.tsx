import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatDay } from '@/features/me/format';
import type { ClassFeed } from '@/features/me/types';

type RecordingRowProps = { item: NonNullable<ClassFeed['recording']>; onPress: () => void };

/** A recorded live lesson of the class: date, topic and length. */
export function RecordingRow({ item, onPress }: RecordingRowProps) {
  const { t } = useTranslation();
  const minutes = t('me.classPage.minutes', { count: item.minutes });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('me.classPage.recordingLabel', { title: item.title, minutes })}
      onPress={onPress}
      className="min-h-[60px] flex-row items-center gap-3 rounded-lg border border-border bg-surf px-3 py-2 active:bg-wax"
    >
      <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-spot">
        <Icon name="play" size={20} color="honey" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="overline" tone="muted">
          {t('me.classPage.recordingOverline', { date: formatDay(t, item.date, true) })}
        </Text>
        <Text className="font-sans-black text-sm">{item.title}</Text>
      </View>
      <Text tone="muted" className="font-sans-bold text-xs">
        {minutes}
      </Text>
    </Pressable>
  );
}
