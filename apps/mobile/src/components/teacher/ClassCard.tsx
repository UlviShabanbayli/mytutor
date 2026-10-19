import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, ProgressBar, Text } from '@/components/ui';
import type { TeacherClass } from '@/features/teacher/types';
import { HexBadge } from './HexBadge';
import { StatTile } from './StatTile';

type ClassCardProps = { cls: TeacherClass };

/** A class on the classes tab: hexagon, name, three counts and this week's activity. */
export function ClassCard({ cls }: ClassCardProps) {
  const { t } = useTranslation();
  const type = cls.paid ? t('teacher.paid') : t('teacher.free');
  const meta =
    cls.groups.length > 0
      ? t('teacher.classes.metaGroups', { book: cls.book, type, count: cls.groups.length })
      : t('teacher.classes.meta', { book: cls.book, type });
  const active = `${cls.activeThisWeek} / ${cls.studentCount}`;
  const label = t('teacher.classes.cardLabel', {
    name: cls.name,
    students: t('teacher.students', { count: cls.studentCount }),
    assignments: cls.activeAssignments,
    unread: cls.chatUnread
      ? t('teacher.classes.unread', { count: cls.chatUnread })
      : t('teacher.classes.allRead'),
    active,
  });

  return (
    <PressableCard
      accessibilityLabel={label}
      onPress={() => router.push({ pathname: '/teacher/class/[id]', params: { id: cls.id } })}
      contentClassName="gap-2.5 px-3.5 pb-3.5 pt-3"
    >
      <View className="flex-row items-center gap-3">
        <HexBadge size={44} tone="honey" label={cls.shortName} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="subheading" numberOfLines={1}>
            {cls.name}
          </Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {meta}
          </Text>
        </View>
        <Icon name="chevron" size={20} color="muted" />
      </View>
      <View className="flex-row gap-1.5">
        <StatTile
          look="inset"
          value={String(cls.studentCount)}
          label={t('teacher.classes.statStudents')}
        />
        <StatTile
          look="inset"
          value={String(cls.activeAssignments)}
          label={t('teacher.classes.statAssignments')}
        />
        <StatTile
          look="inset"
          value={String(cls.chatUnread)}
          label={
            cls.chatUnread ? t('teacher.classes.statUnread') : t('teacher.classes.statAllRead')
          }
          valueClassName={cls.chatUnread ? 'text-err' : 'text-muted'}
        />
      </View>
      <View className="flex-row items-center gap-2.5">
        <Text className="font-sans-bold text-xs text-muted">{t('teacher.classes.activeWeek')}</Text>
        <ProgressBar
          value={cls.studentCount ? cls.activeThisWeek / cls.studentCount : 0}
          accessibilityLabel={`${t('teacher.classes.activeWeek')}: ${active}`}
          className="flex-1"
        />
        <Text className="font-sans-black text-xs">{active}</Text>
      </View>
    </PressableCard>
  );
}
