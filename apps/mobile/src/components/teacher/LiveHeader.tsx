import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { TeacherRoleChip } from './TeacherRoleChip';

type LiveHeaderProps = { title: string; clock: string; present: number; total: number };

/** The room's top: live badge, title, recording notice, lesson clock and attendance. */
export function LiveHeader({ title, clock, present, total }: LiveHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2 px-4 pb-2 pt-3">
      <View className="flex-row items-center gap-2">
        <View className="h-[26px] flex-row items-center gap-1.5 rounded-[8px] bg-err-bg px-2">
          <View className="h-2 w-2 rounded-full bg-err" />
          <Text className="font-sans-black text-xs uppercase tracking-[0.7px] text-err">
            {t('teacher.live.badge')}
          </Text>
        </View>
        <Text
          variant="heading"
          numberOfLines={1}
          className="min-w-0 flex-1 font-display-black text-md"
        >
          {title}
        </Text>
        <TeacherRoleChip />
      </View>
      <View className="flex-row items-center gap-2">
        <View
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-1.5"
        >
          <View className="h-[10px] w-[10px] items-center justify-center rounded-full border-2 border-err">
            <View className="h-1 w-1 rounded-full bg-err" />
          </View>
          <Text className="font-sans-bold text-sm text-err">{t('teacher.live.recording')}</Text>
        </View>
        <View className="flex-1" />
        <Text
          accessibilityLabel={t('teacher.live.clock', { time: clock })}
          className="font-sans-bold text-sm text-muted"
        >
          {clock}
        </Text>
        <View
          accessible
          accessibilityLabel={t('teacher.live.attendance', { present, total })}
          className="h-[26px] flex-row items-center gap-1 rounded-full bg-ok-bg px-2"
        >
          <Icon name="users" size={14} color="ok" />
          <Text className="font-sans-black text-sm text-ok">{`${present} / ${total}`}</Text>
        </View>
      </View>
    </View>
  );
}
