import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LoadingState, Text } from '@/components/ui';
import { useLiveRooms } from '@/features/teacher/queries';
import { clockTime } from '@/features/teacher/time';
import { SmallButton } from './SmallButton';
import { TaskRow } from './TaskRow';

type ClassLivePanelProps = { classId: string };

/** The class's planned live lessons, each with a way into the room. */
export function ClassLivePanel({ classId }: ClassLivePanelProps) {
  const { t } = useTranslation();
  const rooms = useLiveRooms();
  if (rooms.isPending) return <LoadingState />;
  const mine = rooms.data?.filter((r) => r.classId === classId) ?? [];
  if (mine.length === 0) return <Text tone="muted">{t('teacher.class.emptyLive')}</Text>;

  return (
    <View className="gap-2">
      {mine.map((room) => {
        const open = () => router.push({ pathname: '/teacher/live/[id]', params: { id: room.id } });
        return (
          <TaskRow
            key={room.id}
            icon="video"
            title={t('teacher.classes.liveTitle', { time: clockTime(new Date(room.startsAt)) })}
            meta={`${room.title} · ${t('teacher.minutesShort', { count: room.minutes })}`}
            onPress={open}
            trailing={<SmallButton label={t('teacher.class.enterRoom')} onPress={open} />}
          />
        );
      })}
    </View>
  );
}
