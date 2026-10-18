import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LiveRoomView } from '@/components/teacher/LiveRoomView';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { ErrorState, LoadingState } from '@/components/ui';
import { useLiveRoom, useTeacherClass, useTopic } from '@/features/teacher/queries';

/** The live lesson room (design t-live, M5). */
export default function LiveScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const room = useLiveRoom(id);
  const cls = useTeacherClass(room.data?.classId ?? '');
  const topic = useTopic(room.data?.topicId);

  if (room.isError || cls.isError)
    return (
      <TeacherScreen header={<TeacherHeader title={t('teacher.live.badge')} />}>
        <ErrorState onRetry={() => void room.refetch()} />
      </TeacherScreen>
    );
  if (!room.data || !cls.data)
    return (
      <TeacherScreen header={<TeacherHeader title={t('teacher.live.badge')} />}>
        <LoadingState />
      </TeacherScreen>
    );
  return <LiveRoomView room={room.data} cls={cls.data} topic={topic} />;
}
