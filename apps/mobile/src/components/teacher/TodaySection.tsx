import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useTeacherClasses, useTeacherToday } from '@/features/teacher/queries';
import { clockTime, dayOffset, hoursUntil } from '@/features/teacher/time';
import { SectionHeading } from './SectionHeading';
import { TaskRow } from './TaskRow';

/** "Bu gün": homework waiting for a check and the coming live lessons. */
export function TodaySection() {
  const { t } = useTranslation();
  const today = useTeacherToday();
  const classes = useTeacherClasses();
  if (!today.data) return null;
  const className = (id: string) => classes.data?.find((c) => c.id === id)?.shortName ?? '';
  const now = new Date();

  return (
    <View className="gap-2.5 pt-1">
      <SectionHeading>{t('teacher.classes.today')}</SectionHeading>
      {today.data.homework.length === 0 && today.data.live.length === 0 ? (
        <Text tone="muted">{t('teacher.classes.todayEmpty')}</Text>
      ) : null}
      {today.data.homework.map((a) => (
        <TaskRow
          key={a.id}
          icon="edit"
          title={t('teacher.classes.toGrade', { count: a.toGrade })}
          meta={t('teacher.classes.toGradeMeta', {
            class: className(a.classId),
            topic: a.topic?.number ?? '',
          })}
          onPress={() => router.push({ pathname: '/teacher/grade/[id]', params: { id: a.id } })}
        />
      ))}
      {today.data.live.map((room) => {
        const starts = new Date(room.startsAt);
        const hours = hoursUntil(starts, now);
        return (
          <TaskRow
            key={room.id}
            icon="video"
            title={t('teacher.classes.liveTitle', { time: clockTime(starts) })}
            meta={t('teacher.classes.liveMeta', {
              class: className(room.classId),
              title: room.title,
              minutes: t('teacher.minutesShort', { count: room.minutes }),
            })}
            onPress={() => router.push({ pathname: '/teacher/live/[id]', params: { id: room.id } })}
            trailing={
              <View className="rounded-full bg-raised px-2 py-1.5">
                <Text className="font-sans-black text-xs text-honey-text">
                  {dayOffset(starts, now) === 1
                    ? t('teacher.classes.tomorrow')
                    : hours > 0
                      ? t('teacher.classes.inHours', { count: hours })
                      : t('teacher.classes.startsNow')}
                </Text>
              </View>
            }
          />
        );
      })}
    </View>
  );
}
