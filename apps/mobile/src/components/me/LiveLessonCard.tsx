import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { ClassFeed } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { Hex } from './Hex';

type LiveLessonCardProps = {
  live: ClassFeed['live'];
  reminded: boolean;
  onRemind: () => void;
};

/** The next live lesson: when and which topic, that it is recorded, and "Xatırlat". */
export function LiveLessonCard({ live, reminded, onRemind }: LiveLessonCardProps) {
  const { t } = useTranslation();
  const when = formatWhen(t, live.when);

  return (
    <View className="flex-row items-center gap-3 rounded-[18px] bg-info-bg py-3 pl-3.5 pr-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('me.classPage.liveOpen', { when })}
        onPress={() => router.push({ pathname: '/live/[id]', params: { id: live.id } })}
        className="flex-1 flex-row items-center gap-3"
      >
        <Hex width={40} fill="info">
          <Icon name="video" size={20} color="info-bg" />
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text variant="overline" tone="info">
            {t('me.classPage.liveOverline')}
          </Text>
          <Text className="font-sans-black text-sm">
            {t('me.classPage.liveWhen', { when, topic: live.topic })}
          </Text>
          <Text tone="muted" className="text-xs">
            {t('me.classPage.liveNote')}
          </Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: reminded }}
        onPress={onRemind}
        className={cn(
          'min-h-11 flex-row items-center gap-1 rounded-[12px] border-2 border-info px-3',
          reminded && 'bg-info',
        )}
      >
        <Icon name={reminded ? 'check' : 'bell'} size={16} color={reminded ? 'info-bg' : 'info'} />
        <Text className={cn('font-sans-black text-sm', reminded ? 'text-info-bg' : 'text-info')}>
          {reminded ? t('me.classPage.reminded') : t('me.classPage.remind')}
        </Text>
      </Pressable>
    </View>
  );
}
